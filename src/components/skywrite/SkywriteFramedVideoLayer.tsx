import { ResizeMode, Video, type VideoProps } from 'expo-av';
import {
  forwardRef,
  memo,
  useCallback,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  PanResponder,
  Pressable,
  StyleSheet,
  Text,
  View,
  type LayoutChangeEvent,
} from 'react-native';

import { SkywriteCopy } from '@/constants/skywriteCopy';
import { Fonts } from '@/constants/theme';
import { skywriteVideoElementStyle } from '@/skywrite/media/skywriteVideoLayout';
import {
  canPanVideoFraming,
  computeVideoStageLayout,
  framingToTranslation,
  resolveVideoFraming,
  resolveVideoStageFit,
  translationToFraming,
} from '@/skywrite/media/skywriteVideoFraming';
import type { SkywriteVideoMedia } from '@/skywrite/types';

export interface SkywriteFramedVideoLayerRef {
  beginAdjust: () => void;
}

interface SkywriteFramedVideoLayerProps {
  video: SkywriteVideoMedia;
  aspectRatio: number;
  editable?: boolean;
  onVideoPatch?: (patch: Partial<SkywriteVideoMedia>) => void;
  videoRef?: VideoProps['ref'];
  onPlaybackStatusUpdate?: VideoProps['onPlaybackStatusUpdate'];
  onLoad?: VideoProps['onLoad'];
  isPlaying?: boolean;
  onPauseForAdjust?: () => Promise<void> | void;
  onResumeAfterAdjust?: (wasPlaying: boolean) => Promise<void> | void;
}

const SkywriteFramedVideoLayerComponent = forwardRef<
  SkywriteFramedVideoLayerRef,
  SkywriteFramedVideoLayerProps
>(function SkywriteFramedVideoLayerComponent(
  {
    video,
    aspectRatio,
    editable = false,
    onVideoPatch,
    videoRef,
    onPlaybackStatusUpdate,
    onLoad,
    isPlaying = false,
    onPauseForAdjust,
    onResumeAfterAdjust,
  },
  ref,
) {
  const stageFit = resolveVideoStageFit(video);
  const framing = resolveVideoFraming(video);
  const [stageSize, setStageSize] = useState({ width: 0, height: 0 });
  const [adjustActive, setAdjustActive] = useState(false);
  const [hint, setHint] = useState<string | null>(null);
  const [liveTranslate, setLiveTranslate] = useState<{ x: number; y: number } | null>(null);
  const wasPlayingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0 });

  const layout = useMemo(
    () =>
      computeVideoStageLayout(
        stageSize.width || 1,
        stageSize.height || 1,
        aspectRatio,
        stageFit,
      ),
    [aspectRatio, stageFit, stageSize.height, stageSize.width],
  );

  const baseTranslation = useMemo(
    () => framingToTranslation(framing, layout),
    [framing, layout],
  );

  const translateX = liveTranslate?.x ?? baseTranslation.translateX;
  const translateY = liveTranslate?.y ?? baseTranslation.translateY;

  const onStageLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setStageSize({ width, height });
  };

  const commitFraming = useCallback(
    (nextX: number, nextY: number) => {
      const next = translationToFraming(nextX, nextY, layout);
      onVideoPatch?.({
        framingOffsetX: next.offsetX,
        framingOffsetY: next.offsetY,
      });
      setLiveTranslate(null);
    },
    [layout, onVideoPatch],
  );

  const enterAdjustMode = useCallback(async () => {
    if (!editable) return;
    if (stageFit === 'fit' && !canPanVideoFraming(layout)) {
      setHint(SkywriteCopy.videoFramingFillHint);
      return;
    }
    setHint(null);
    wasPlayingRef.current = isPlaying;
    if (isPlaying) await onPauseForAdjust?.();
    dragStartRef.current = { x: baseTranslation.translateX, y: baseTranslation.translateY };
    setAdjustActive(true);
  }, [
    baseTranslation.translateX,
    baseTranslation.translateY,
    editable,
    isPlaying,
    layout,
    onPauseForAdjust,
    stageFit,
  ]);

  const exitAdjustMode = useCallback(async () => {
    setAdjustActive(false);
    const resume = wasPlayingRef.current;
    wasPlayingRef.current = false;
    await onResumeAfterAdjust?.(resume);
  }, [onResumeAfterAdjust]);

  useImperativeHandle(ref, () => ({ beginAdjust: () => void enterAdjustMode() }), [enterAdjustMode]);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => adjustActive,
        onMoveShouldSetPanResponder: () => adjustActive,
        onPanResponderGrant: () => {
          dragStartRef.current = { x: translateX, y: translateY };
        },
        onPanResponderMove: (_, gesture) => {
          const nextX = dragStartRef.current.x + gesture.dx;
          const nextY = dragStartRef.current.y + gesture.dy;
          setLiveTranslate({
            x: Math.max(-layout.maxPanX, Math.min(layout.maxPanX, nextX)),
            y: Math.max(-layout.maxPanY, Math.min(layout.maxPanY, nextY)),
          });
        },
        onPanResponderRelease: (_, gesture) => {
          const nextX = dragStartRef.current.x + gesture.dx;
          const nextY = dragStartRef.current.y + gesture.dy;
          const clampedX = Math.max(-layout.maxPanX, Math.min(layout.maxPanX, nextX));
          const clampedY = Math.max(-layout.maxPanY, Math.min(layout.maxPanY, nextY));
          commitFraming(clampedX, clampedY);
          void exitAdjustMode();
        },
        onPanResponderTerminate: () => {
          setLiveTranslate(null);
          void exitAdjustMode();
        },
      }),
    [adjustActive, commitFraming, exitAdjustMode, layout.maxPanX, layout.maxPanY, translateX, translateY],
  );

  const left = (layout.stageWidth - layout.videoWidth) / 2 + translateX;
  const top = (layout.stageHeight - layout.videoHeight) / 2 + translateY;
  const resizeMode = stageFit === 'fill' ? ResizeMode.COVER : ResizeMode.CONTAIN;

  return (
    <View style={styles.stage} onLayout={onStageLayout}>
      <View style={styles.clip} {...(adjustActive ? panResponder.panHandlers : {})}>
        {editable && !adjustActive ? (
          <Pressable
            style={StyleSheet.absoluteFill}
            delayLongPress={450}
            onLongPress={() => void enterAdjustMode()}
            accessibilityHint={SkywriteCopy.videoFramingLongPressHint}
          />
        ) : null}
        {stageSize.width > 0 ? (
          <View
            pointerEvents="none"
            style={{
              position: 'absolute',
              left,
              top,
              width: layout.videoWidth,
              height: layout.videoHeight,
            }}>
            <Video
              ref={videoRef}
              style={skywriteVideoElementStyle()}
              source={{ uri: video.uri }}
              useNativeControls={false}
              resizeMode={resizeMode}
              isLooping={false}
              progressUpdateIntervalMillis={250}
              onPlaybackStatusUpdate={onPlaybackStatusUpdate}
              onLoad={onLoad}
            />
          </View>
        ) : null}
      </View>

      {adjustActive ? (
        <View style={styles.guideOverlay} pointerEvents="none">
          <View style={styles.guideVertical} />
          <View style={styles.guideHorizontal} />
          <Text style={styles.guideLabel}>{SkywriteCopy.videoFramingAdjusting}</Text>
        </View>
      ) : null}

      {hint ? (
        <View style={styles.hintBanner} pointerEvents="box-none">
          <Text style={styles.hintText}>{hint}</Text>
          <Pressable
            style={styles.hintBtn}
            onPress={() => {
              onVideoPatch?.({ stageFit: 'fill' });
              setHint(null);
            }}>
            <Text style={styles.hintBtnText}>{SkywriteCopy.videoFramingFill}</Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
});

export const SkywriteFramedVideoLayer = memo(SkywriteFramedVideoLayerComponent);

export interface SkywriteFramingToolbarProps {
  video: SkywriteVideoMedia;
  editable?: boolean;
  onVideoPatch?: (patch: Partial<SkywriteVideoMedia>) => void;
  onRequestAdjust?: () => void;
}

export const SkywriteFramingToolbar = memo(function SkywriteFramingToolbar({
  video,
  editable,
  onVideoPatch,
  onRequestAdjust,
}: SkywriteFramingToolbarProps) {
  if (!editable || !onVideoPatch) return null;
  const stageFit = resolveVideoStageFit(video);
  const framing = resolveVideoFraming(video);
  const hasCustomFraming = framing.offsetX !== 0 || framing.offsetY !== 0 || stageFit === 'fill';

  return (
    <View style={toolbarStyles.row}>
      <Chip
        label={SkywriteCopy.videoFramingFit}
        active={stageFit === 'fit'}
        onPress={() =>
          onVideoPatch({
            stageFit: 'fit',
            framingOffsetX: 0,
            framingOffsetY: 0,
          })
        }
      />
      <Chip
        label={SkywriteCopy.videoFramingFill}
        active={stageFit === 'fill'}
        onPress={() => onVideoPatch({ stageFit: 'fill' })}
      />
      <Chip label={SkywriteCopy.videoFramingAdjust} onPress={() => onRequestAdjust?.()} />
      {hasCustomFraming ? (
        <Chip
          label={SkywriteCopy.videoFramingReset}
          onPress={() =>
            onVideoPatch({
              stageFit: 'fit',
              framingOffsetX: 0,
              framingOffsetY: 0,
            })
          }
        />
      ) : null}
    </View>
  );
});

function Chip({
  label,
  active,
  onPress,
}: {
  label: string;
  active?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={[toolbarStyles.chip, active && toolbarStyles.chipActive]}>
      <Text style={toolbarStyles.chipText}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  stage: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#050508',
  },
  clip: {
    ...StyleSheet.absoluteFill,
    overflow: 'hidden',
  },
  guideOverlay: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  guideVertical: {
    position: 'absolute',
    width: StyleSheet.hairlineWidth,
    top: '20%',
    bottom: '20%',
    backgroundColor: 'rgba(232, 200, 114, 0.45)',
  },
  guideHorizontal: {
    position: 'absolute',
    height: StyleSheet.hairlineWidth,
    left: '15%',
    right: '15%',
    backgroundColor: 'rgba(232, 200, 114, 0.45)',
  },
  guideLabel: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(248, 244, 236, 0.88)',
    marginTop: 8,
    backgroundColor: 'rgba(8, 10, 28, 0.55)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  hintBanner: {
    position: 'absolute',
    left: 12,
    right: 12,
    top: '38%',
    padding: 12,
    borderRadius: 10,
    backgroundColor: 'rgba(8, 10, 28, 0.88)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(232, 200, 114, 0.35)',
    alignItems: 'center',
    gap: 10,
  },
  hintText: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    lineHeight: 18,
    color: 'rgba(248, 244, 236, 0.9)',
    textAlign: 'center',
  },
  hintBtn: {
    minHeight: 36,
    paddingHorizontal: 14,
    justifyContent: 'center',
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(232, 200, 114, 0.45)',
  },
  hintBtnText: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    fontWeight: '700',
    color: '#E8C872',
  },
});

const toolbarStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  chip: {
    minHeight: 36,
    paddingHorizontal: 12,
    justifyContent: 'center',
    borderRadius: 999,
    backgroundColor: 'rgba(8, 10, 28, 0.55)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(167, 139, 250, 0.35)',
  },
  chipActive: {
    borderColor: 'rgba(232, 200, 114, 0.65)',
    backgroundColor: 'rgba(232, 200, 114, 0.12)',
  },
  chipText: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    fontWeight: '600',
    color: '#E8C872',
  },
});
