import { Image } from 'expo-image';
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
import { useSkywriteFramingPointerDrag } from '@/skywrite/media/useSkywriteFramingPointerDrag';
import {
  canPanVideoFraming,
  computeVideoStageLayout,
  describePanAxes,
  framingToTranslation,
  resolveVideoFraming,
  resolveVideoStageFit,
  translationToFraming,
} from '@/skywrite/media/skywriteVideoFraming';
import { skywritePhotoAspectRatio } from '@/skywrite/media/skywriteVideoLayout';
import type { SkywritePhotoMedia } from '@/skywrite/types';

export interface SkywriteFramedPhotoLayerRef {
  beginAdjust: () => void;
  endAdjust: () => void;
  isAdjustActive: () => boolean;
}

interface SkywriteFramedPhotoLayerProps {
  photo: SkywritePhotoMedia;
  /** When false, stage fills parent (SkyReel). When set, fixed story frame. */
  fixedAspectStage?: number;
  editable?: boolean;
  onPhotoPatch?: (patch: Partial<SkywritePhotoMedia>) => void;
  onAdjustModeChange?: (active: boolean) => void;
  showFitBackdrop?: boolean;
}

const SkywriteFramedPhotoLayerComponent = forwardRef<
  SkywriteFramedPhotoLayerRef,
  SkywriteFramedPhotoLayerProps
>(function SkywriteFramedPhotoLayerComponent(
  {
    photo,
    fixedAspectStage,
    editable = false,
    onPhotoPatch,
    onAdjustModeChange,
    showFitBackdrop = true,
  },
  ref,
) {
  const stageFit = resolveVideoStageFit(photo);
  const framing = resolveVideoFraming(photo);
  const aspectRatio = skywritePhotoAspectRatio(photo.width, photo.height);
  const [stageSize, setStageSize] = useState({ width: 0, height: 0 });
  const [adjustActive, setAdjustActive] = useState(false);
  const [hint, setHint] = useState<string | null>(null);
  const [liveTranslate, setLiveTranslate] = useState<{ x: number; y: number } | null>(null);
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
      onPhotoPatch?.({
        framingOffsetX: next.offsetX,
        framingOffsetY: next.offsetY,
      });
      setLiveTranslate(null);
    },
    [layout, onPhotoPatch],
  );

  const enterAdjustMode = useCallback(() => {
    if (!editable) return;
    if (stageFit !== 'fill') {
      setHint(SkywriteCopy.photoFramingFillHint);
      return;
    }
    if (!canPanVideoFraming(layout)) {
      setHint(SkywriteCopy.videoFramingNoOverflowHint);
      return;
    }
    setHint(null);
    dragStartRef.current = { x: baseTranslation.translateX, y: baseTranslation.translateY };
    setAdjustActiveState(true);
  }, [baseTranslation.translateX, baseTranslation.translateY, editable, layout, setAdjustActiveState, stageFit]);

  const exitAdjustMode = useCallback(
    (snapToCenter = true) => {
      const { x, y } = translateLiveRef.current;
      persistTranslation(x, y, snapToCenter);
      setAdjustActiveState(false);
      setLiveTranslate(null);
    },
    [persistTranslation, setAdjustActiveState],
  );

  useImperativeHandle(
    ref,
    () => ({
      beginAdjust: () => enterAdjustMode(),
      endAdjust: () => exitAdjustMode(true),
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
        onPanResponderTerminate: () => setLiveTranslate(null),
      }),
    [adjustActive, layout, persistTranslation, translateX, translateY],
  );

  const left = (layout.stageWidth - layout.videoWidth) / 2 + translateX;
  const top = (layout.stageHeight - layout.videoHeight) / 2 + translateY;

  const adjustSurfaceStyle = useMemo((): ViewStyle => {
    if (!adjustActive) return styles.adjustSurface;
    const active = { ...styles.adjustSurface, ...styles.adjustSurfaceActive };
    if (Platform.OS === 'web') {
      return { ...active, cursor: 'grab', userSelect: 'none', touchAction: 'none' } as unknown as ViewStyle;
    }
    return active;
  }, [adjustActive]);

  const nativePanHandlers = Platform.OS === 'web' ? {} : panResponder.panHandlers;

  const stageFrameStyle = fixedAspectStage
    ? { width: '100%' as const, aspectRatio: fixedAspectStage, alignSelf: 'center' as const }
    : StyleSheet.absoluteFill;

  return (
    <View style={fixedAspectStage ? styles.fixedRoot : styles.stage}>
      <View style={[styles.clip, stageFrameStyle]} onLayout={onStageLayout}>
        {showFitBackdrop && stageFit === 'fit' && stageSize.width > 0 ? (
          <>
            <Image
              source={{ uri: photo.uri }}
              style={StyleSheet.absoluteFill}
              contentFit="cover"
              blurRadius={24}
              accessibilityIgnoresInvertColors
            />
            <View style={styles.backdropDim} pointerEvents="none" />
          </>
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
            <Image
              source={{ uri: photo.uri }}
              style={{ width: layout.videoWidth, height: layout.videoHeight }}
              contentFit={stageFit === 'fill' ? 'cover' : 'contain'}
              accessibilityIgnoresInvertColors
            />
          </View>
        ) : null}
      </View>

      {adjustActive ? (
        <View
          style={[adjustSurfaceStyle, fixedAspectStage ? styles.adjustInFixed : null]}
          {...nativePanHandlers}
          {...pointerHandlers}
          accessibilityLabel="Photo framing adjustment surface">
          <View style={styles.guideOverlay} pointerEvents="none">
            <View style={styles.guideVertical} />
            <View style={styles.guideHorizontal} />
            <Text style={styles.guideLabel}>{SkywriteCopy.videoFramingAdjusting}</Text>
          </View>
          <Pressable style={styles.doneBtn} accessibilityRole="button" onPress={() => exitAdjustMode(true)}>
            <Text style={styles.doneBtnText}>{SkywriteCopy.videoFramingDone}</Text>
          </Pressable>
        </View>
      ) : null}

      {editable && !adjustActive ? (
        <Pressable
          style={StyleSheet.absoluteFill}
          delayLongPress={450}
          onLongPress={() => enterAdjustMode()}
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
                onPhotoPatch?.({ stageFit: 'fill' });
                setHint(null);
              }}>
              <Text style={styles.hintBtnText}>{SkywriteCopy.photoFramingFillScreen}</Text>
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

export const SkywriteFramedPhotoLayer = memo(SkywriteFramedPhotoLayerComponent);

export const SkywritePhotoFramingToolbar = memo(function SkywritePhotoFramingToolbar({
  photo,
  editable,
  adjustActive = false,
  onPhotoPatch,
  onRequestAdjust,
  onRequestDone,
}: {
  photo: SkywritePhotoMedia;
  editable?: boolean;
  adjustActive?: boolean;
  onPhotoPatch?: (patch: Partial<SkywritePhotoMedia>) => void;
  onRequestAdjust?: () => void;
  onRequestDone?: () => void;
}) {
  if (!editable || !onPhotoPatch) return null;
  const stageFit = resolveVideoStageFit(photo);
  const framing = resolveVideoFraming(photo);
  const hasCustom =
    framing.offsetX !== 0 || framing.offsetY !== 0 || stageFit === 'fill';
  const isLandscape =
    photo.width != null && photo.height != null && photo.width > photo.height * 1.05;

  return (
    <View style={toolbarStyles.row}>
      <Chip
        label={SkywriteCopy.videoFramingFit}
        active={stageFit === 'fit' && !adjustActive}
        onPress={() => {
          onRequestDone?.();
          onPhotoPatch({ stageFit: 'fit', framingOffsetX: 0, framingOffsetY: 0 });
        }}
      />
      <Chip
        label={SkywriteCopy.photoFramingFillScreen}
        active={stageFit === 'fill' && !adjustActive}
        onPress={() => {
          onRequestDone?.();
          onPhotoPatch({ stageFit: 'fill' });
        }}
      />
      <Chip
        label={adjustActive ? SkywriteCopy.videoFramingDone : SkywriteCopy.videoFramingAdjust}
        active={adjustActive}
        onPress={() => (adjustActive ? onRequestDone?.() : onRequestAdjust?.())}
      />
      {hasCustom ? (
        <Chip
          label={SkywriteCopy.videoFramingReset}
          onPress={() => {
            onRequestDone?.();
            onPhotoPatch({ stageFit: 'fit', framingOffsetX: 0, framingOffsetY: 0 });
          }}
        />
      ) : null}
    </View>
  );
});

function Chip({ label, active, onPress }: { label: string; active?: boolean; onPress: () => void }) {
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
  stage: { ...StyleSheet.absoluteFill, backgroundColor: '#050508' },
  fixedRoot: { width: '100%', height: '100%' },
  clip: { flex: 1, width: '100%', overflow: 'hidden', backgroundColor: '#050508' },
  backdropDim: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(4, 6, 18, 0.42)' },
  adjustSurface: {
    ...StyleSheet.absoluteFill,
    zIndex: 3,
    backgroundColor: 'rgba(232, 200, 114, 0.06)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(232, 200, 114, 0.35)',
  },
  adjustInFixed: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 },
  adjustSurfaceActive: { backgroundColor: 'rgba(232, 200, 114, 0.1)' },
  guideOverlay: { ...StyleSheet.absoluteFill, alignItems: 'center', justifyContent: 'center' },
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
  doneBtnText: { fontFamily: Fonts.sans, fontSize: 12, fontWeight: '700', color: '#E8C872' },
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
  hintBtnText: { fontFamily: Fonts.sans, fontSize: 12, fontWeight: '700', color: '#E8C872' },
});

const toolbarStyles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 4 },
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
  chipText: { fontFamily: Fonts.sans, fontSize: 12, fontWeight: '600', color: '#E8C872' },
});
