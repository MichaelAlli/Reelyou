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
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  type LayoutChangeEvent,
  type ViewStyle,
} from 'react-native';

import { SkywriteCopy } from '@/constants/skywriteCopy';
import { Fonts } from '@/constants/theme';
import { skywriteVideoElementStyle } from '@/skywrite/media/skywriteVideoLayout';
import {
  canPanVideoFraming,
  computeVideoStageLayout,
  describePanAxes,
  framingToTranslation,
  resolveVideoFraming,
  resolveVideoStageFit,
  translationToFraming,
} from '@/skywrite/media/skywriteVideoFraming';
import { useSkywriteFramingPointerDrag } from '@/skywrite/media/useSkywriteFramingPointerDrag';
import type { SkywriteVideoMedia } from '@/skywrite/types';

export interface SkywriteFramedVideoLayerRef {
  beginAdjust: () => void;
  endAdjust: () => void;
  isAdjustActive: () => boolean;
}

interface SkywriteFramedVideoLayerProps {
  video: SkywriteVideoMedia;
  aspectRatio: number;
  editable?: boolean;
  onVideoPatch?: (patch: Partial<SkywriteVideoMedia>) => void;
  onAdjustModeChange?: (active: boolean) => void;
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
    onAdjustModeChange,
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
  const translateLiveRef = useRef({ x: translateX, y: translateY });
  translateLiveRef.current = { x: translateX, y: translateY };

  const setAdjustActiveState = useCallback(
    (active: boolean) => {
      setAdjustActive(active);
      onAdjustModeChange?.(active);
    },
    [onAdjustModeChange],
  );

  const onStageLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setStageSize({ width, height });
  };

  const persistTranslation = useCallback(
    (nextX: number, nextY: number, snapToCenter = false) => {
      const next = translationToFraming(nextX, nextY, layout, { snapToCenter });
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
    if (stageFit !== 'fill') {
      setHint(SkywriteCopy.videoFramingFillHint);
      return;
    }
    if (!canPanVideoFraming(layout)) {
      setHint(SkywriteCopy.videoFramingNoOverflowHint);
      return;
    }
    const axes = describePanAxes(layout);
    if (!axes.canPanX && !axes.canPanY) {
      setHint(SkywriteCopy.videoFramingNoOverflowHint);
      return;
    }
    setHint(null);
    wasPlayingRef.current = isPlaying;
    if (isPlaying) await onPauseForAdjust?.();
    dragStartRef.current = { x: baseTranslation.translateX, y: baseTranslation.translateY };
    setAdjustActiveState(true);
  }, [
    baseTranslation.translateX,
    baseTranslation.translateY,
    editable,
    isPlaying,
    layout,
    onPauseForAdjust,
    setAdjustActiveState,
    stageFit,
  ]);

  const exitAdjustMode = useCallback(
    async (snapToCenter = true) => {
      const { x, y } = translateLiveRef.current;
      persistTranslation(x, y, snapToCenter);
      setAdjustActiveState(false);
      setLiveTranslate(null);
      const resume = wasPlayingRef.current;
      wasPlayingRef.current = false;
      await onResumeAfterAdjust?.(resume);
    },
    [onResumeAfterAdjust, persistTranslation, setAdjustActiveState],
  );

  useImperativeHandle(
    ref,
    () => ({
      beginAdjust: () => void enterAdjustMode(),
      endAdjust: () => void exitAdjustMode(),
      isAdjustActive: () => adjustActive,
    }),
    [adjustActive, enterAdjustMode, exitAdjustMode],
  );

  const handleLiveTranslate = useCallback((x: number, y: number) => {
    setLiveTranslate({ x, y });
  }, []);

  const handleCommitTranslate = useCallback(
    (x: number, y: number) => {
      persistTranslation(x, y, false);
    },
    [persistTranslation],
  );

  const { pointerHandlers } = useSkywriteFramingPointerDrag({
    enabled: adjustActive,
    layout,
    translateX,
    translateY,
    onLiveTranslate: handleLiveTranslate,
    onCommit: handleCommitTranslate,
  });

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => adjustActive,
        onMoveShouldSetPanResponder: () => adjustActive,
        onStartShouldSetPanResponderCapture: () => adjustActive,
        onMoveShouldSetPanResponderCapture: () => adjustActive,
        onPanResponderTerminationRequest: () => false,
        onShouldBlockNativeResponder: () => adjustActive,
        onPanResponderGrant: () => {
          dragStartRef.current = { x: translateX, y: translateY };
        },
        onPanResponderMove: (_, gesture) => {
          const { maxPanX, maxPanY } = layout;
          const nextX = Math.max(-maxPanX, Math.min(maxPanX, dragStartRef.current.x + gesture.dx));
          const nextY = Math.max(-maxPanY, Math.min(maxPanY, dragStartRef.current.y + gesture.dy));
          setLiveTranslate({ x: nextX, y: nextY });
        },
        onPanResponderRelease: (_, gesture) => {
          const { maxPanX, maxPanY } = layout;
          const nextX = Math.max(-maxPanX, Math.min(maxPanX, dragStartRef.current.x + gesture.dx));
          const nextY = Math.max(-maxPanY, Math.min(maxPanY, dragStartRef.current.y + gesture.dy));
          persistTranslation(nextX, nextY, false);
        },
        onPanResponderTerminate: () => {
          setLiveTranslate(null);
        },
      }),
    [adjustActive, layout, persistTranslation, translateX, translateY],
  );

  const left = (layout.stageWidth - layout.videoWidth) / 2 + translateX;
  const top = (layout.stageHeight - layout.videoHeight) / 2 + translateY;

  const adjustSurfaceStyle = useMemo((): ViewStyle => {
    if (!adjustActive) return styles.adjustSurface;
    const active = { ...styles.adjustSurface, ...styles.adjustSurfaceActive };
    if (Platform.OS === 'web') {
      return {
        ...active,
        cursor: 'grab',
        userSelect: 'none',
        touchAction: 'none',
      } as ViewStyle;
    }
    return active;
  }, [adjustActive]);

  const nativePanHandlers = Platform.OS === 'web' ? {} : panResponder.panHandlers;

  return (
    <View style={styles.stage} onLayout={onStageLayout}>
      <View style={styles.clip}>
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
              resizeMode={ResizeMode.CONTAIN}
              isLooping={false}
              progressUpdateIntervalMillis={250}
              onPlaybackStatusUpdate={onPlaybackStatusUpdate}
              onLoad={onLoad}
            />
          </View>
        ) : null}
      </View>

      {adjustActive ? (
        <View
          style={adjustSurfaceStyle}
          {...nativePanHandlers}
          {...pointerHandlers}
          accessibilityLabel="Video framing adjustment surface">
          <View style={styles.guideOverlay} pointerEvents="none">
            <View style={styles.guideVertical} />
            <View style={styles.guideHorizontal} />
            <Text style={styles.guideLabel}>{SkywriteCopy.videoFramingAdjusting}</Text>
          </View>
          <Pressable
            style={styles.doneBtn}
            accessibilityRole="button"
            onPress={() => {
              void exitAdjustMode(true);
            }}>
            <Text style={styles.doneBtnText}>{SkywriteCopy.videoFramingDone}</Text>
          </Pressable>
        </View>
      ) : null}

      {editable && !adjustActive ? (
        <Pressable
          style={StyleSheet.absoluteFill}
          delayLongPress={450}
          onLongPress={() => void enterAdjustMode()}
          accessibilityHint={SkywriteCopy.videoFramingLongPressHint}
        />
      ) : null}

      {hint ? (
        <View style={styles.hintBanner} pointerEvents="box-none">
          <Text style={styles.hintText}>{hint}</Text>
          {stageFit !== 'fill' ? (
            <Pressable
              style={styles.hintBtn}
              onPress={() => {
                onVideoPatch?.({ stageFit: 'fill' });
                setHint(null);
              }}>
              <Text style={styles.hintBtnText}>{SkywriteCopy.videoFramingFill}</Text>
            </Pressable>
          ) : (
            <Pressable style={styles.hintBtn} onPress={() => setHint(null)}>
              <Text style={styles.hintBtnText}>OK</Text>
            </Pressable>
          )}
        </View>
      ) : null}
    </View>
  );
});

export const SkywriteFramedVideoLayer = memo(SkywriteFramedVideoLayerComponent);

export interface SkywriteFramingToolbarProps {
  video: SkywriteVideoMedia;
  editable?: boolean;
  adjustActive?: boolean;
  onVideoPatch?: (patch: Partial<SkywriteVideoMedia>) => void;
  onRequestAdjust?: () => void;
  onRequestDone?: () => void;
}

export const SkywriteFramingToolbar = memo(function SkywriteFramingToolbar({
  video,
  editable,
  adjustActive = false,
  onVideoPatch,
  onRequestAdjust,
  onRequestDone,
}: SkywriteFramingToolbarProps) {
  if (!editable || !onVideoPatch) return null;
  const stageFit = resolveVideoStageFit(video);
  const framing = resolveVideoFraming(video);
  const hasCustomFraming = framing.offsetX !== 0 || framing.offsetY !== 0 || stageFit === 'fill';

  return (
    <View style={toolbarStyles.row}>
      <Chip
        label={SkywriteCopy.videoFramingFit}
        active={stageFit === 'fit' && !adjustActive}
        onPress={() => {
          onRequestDone?.();
          onVideoPatch({
            stageFit: 'fit',
            framingOffsetX: 0,
            framingOffsetY: 0,
          });
        }}
      />
      <Chip
        label={SkywriteCopy.videoFramingFill}
        active={stageFit === 'fill' && !adjustActive}
        onPress={() => {
          onRequestDone?.();
          onVideoPatch({ stageFit: 'fill' });
        }}
      />
      <Chip
        label={adjustActive ? SkywriteCopy.videoFramingDone : SkywriteCopy.videoFramingAdjust}
        active={adjustActive}
        onPress={() => (adjustActive ? onRequestDone?.() : onRequestAdjust?.())}
      />
      {hasCustomFraming ? (
        <Chip
          label={SkywriteCopy.videoFramingReset}
          onPress={() => {
            onRequestDone?.();
            onVideoPatch({
              stageFit: 'fit',
              framingOffsetX: 0,
              framingOffsetY: 0,
            });
          }}
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
  adjustSurface: {
    ...StyleSheet.absoluteFill,
    zIndex: 3,
    backgroundColor: 'rgba(232, 200, 114, 0.06)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(232, 200, 114, 0.35)',
  },
  adjustSurfaceActive: {
    backgroundColor: 'rgba(232, 200, 114, 0.1)',
  },
  guideOverlay: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  guideVertical: {
    position: 'absolute',
    width: StyleSheet.hairlineWidth,
    top: '18%',
    bottom: '18%',
    backgroundColor: 'rgba(232, 200, 114, 0.5)',
  },
  guideHorizontal: {
    position: 'absolute',
    height: StyleSheet.hairlineWidth,
    left: '12%',
    right: '12%',
    backgroundColor: 'rgba(232, 200, 114, 0.5)',
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
  doneBtn: {
    position: 'absolute',
    top: 12,
    right: 12,
    minHeight: 36,
    paddingHorizontal: 14,
    justifyContent: 'center',
    borderRadius: 999,
    backgroundColor: 'rgba(8, 10, 28, 0.82)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(232, 200, 114, 0.55)',
  },
  doneBtnText: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    fontWeight: '700',
    color: '#E8C872',
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
    zIndex: 4,
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
