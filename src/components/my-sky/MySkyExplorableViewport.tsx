import { ReactNode, memo, useCallback, useEffect, useRef, useState } from 'react';
import { LayoutChangeEvent, StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import type { MySkyViewportSnapshot } from '@/mySky/mySkyViewportSession';

/**
 * World scale vs viewport — larger factor = more explorable space before pan clamps.
 * Previous 1.55 only allowed ~27% viewport travel per axis at rest zoom.
 */
export const MY_SKY_WORLD_FACTOR = 2.65;
const MIN_SCALE = 0.85;
const MAX_SCALE = 2.35;
/** Slight extra pan beyond strict content bounds — keeps edges from feeling abrupt. */
const PAN_BOUNDARY_RELAX = 1.08;
/** Background moves slightly slower than stars for subtle depth. */
const PARALLAX_RATE = 0.88;
const JUMP_DURATION_MS = 480;

function clamp(value: number, min: number, max: number) {
  'worklet';
  return Math.min(max, Math.max(min, value));
}

interface MySkyExplorableViewportProps {
  renderBackground: (worldSize: { width: number; height: number }) => ReactNode;
  renderForeground: (worldSize: { width: number; height: number }) => ReactNode;
  initialSnapshot?: MySkyViewportSnapshot;
  jumpSnapshot?: MySkyViewportSnapshot | null;
  onSnapshotChange?: (snapshot: MySkyViewportSnapshot) => void;
  onViewportLiveChange?: (snapshot: MySkyViewportSnapshot) => void;
  onWorldSizeChange?: (worldSize: { width: number; height: number }) => void;
}

function MySkyExplorableViewportComponent({
  renderBackground,
  renderForeground,
  initialSnapshot,
  jumpSnapshot,
  onSnapshotChange,
  onViewportLiveChange,
  onWorldSizeChange,
}: MySkyExplorableViewportProps) {
  const [layout, setLayout] = useState({ width: 0, height: 0, worldWidth: 0, worldHeight: 0 });
  const lastLivePublish = useRef(0);

  const viewportWidth = useSharedValue(0);
  const viewportHeight = useSharedValue(0);
  const worldWidth = useSharedValue(0);
  const worldHeight = useSharedValue(0);

  const offsetX = useSharedValue(initialSnapshot?.offsetX ?? 0);
  const offsetY = useSharedValue(initialSnapshot?.offsetY ?? 0);
  const scale = useSharedValue(initialSnapshot?.scale ?? 1);
  const panStartX = useSharedValue(0);
  const panStartY = useSharedValue(0);
  const pinchStartScale = useSharedValue(1);

  useEffect(() => {
    if (!initialSnapshot) return;
    offsetX.value = initialSnapshot.offsetX;
    offsetY.value = initialSnapshot.offsetY;
    scale.value = initialSnapshot.scale;
  }, [initialSnapshot, offsetX, offsetY, scale]);

  const publishSnapshot = useCallback(() => {
    onSnapshotChange?.({
      offsetX: offsetX.value,
      offsetY: offsetY.value,
      scale: scale.value,
    });
  }, [offsetX, offsetY, onSnapshotChange, scale]);

  useEffect(() => {
    if (!jumpSnapshot) return;
    offsetX.value = withTiming(jumpSnapshot.offsetX, { duration: JUMP_DURATION_MS });
    offsetY.value = withTiming(jumpSnapshot.offsetY, { duration: JUMP_DURATION_MS });
    scale.value = withTiming(
      jumpSnapshot.scale,
      { duration: JUMP_DURATION_MS },
      (finished) => {
        if (finished && onSnapshotChange) {
          runOnJS(publishSnapshot)();
        }
      },
    );
  }, [jumpSnapshot, offsetX, offsetY, onSnapshotChange, publishSnapshot, scale]);

  const publishLive = useCallback(() => {
    if (!onViewportLiveChange) return;
    const now = Date.now();
    if (now - lastLivePublish.current < 80) return;
    lastLivePublish.current = now;
    onViewportLiveChange({
      offsetX: offsetX.value,
      offsetY: offsetY.value,
      scale: scale.value,
    });
  }, [offsetX, offsetY, onViewportLiveChange, scale]);

  const onLayout = useCallback(
    (event: LayoutChangeEvent) => {
      const { width, height } = event.nativeEvent.layout;
      if (width <= 0 || height <= 0) return;

      const nextWorldWidth = width * MY_SKY_WORLD_FACTOR;
      const nextWorldHeight = height * MY_SKY_WORLD_FACTOR;

      viewportWidth.value = width;
      viewportHeight.value = height;
      worldWidth.value = nextWorldWidth;
      worldHeight.value = nextWorldHeight;

      setLayout({
        width,
        height,
        worldWidth: nextWorldWidth,
        worldHeight: nextWorldHeight,
      });
      onWorldSizeChange?.({ width: nextWorldWidth, height: nextWorldHeight });
    },
    [onWorldSizeChange, viewportHeight, viewportWidth, worldHeight, worldWidth],
  );

  const pan = Gesture.Pan()
    .minDistance(10)
    .onBegin(() => {
      panStartX.value = offsetX.value;
      panStartY.value = offsetY.value;
    })
    .onUpdate((event) => {
      const s = scale.value;
      const scaledW = worldWidth.value * s;
      const scaledH = worldHeight.value * s;
      const maxX = Math.max(0, ((scaledW - viewportWidth.value) / 2) * PAN_BOUNDARY_RELAX);
      const maxY = Math.max(0, ((scaledH - viewportHeight.value) / 2) * PAN_BOUNDARY_RELAX);

      offsetX.value = clamp(panStartX.value + event.translationX, -maxX, maxX);
      offsetY.value = clamp(panStartY.value + event.translationY, -maxY, maxY);

      if (onViewportLiveChange) {
        runOnJS(publishLive)();
      }
    })
    .onEnd(() => {
      if (onSnapshotChange) {
        runOnJS(publishSnapshot)();
      } else if (onViewportLiveChange) {
        runOnJS(publishLive)();
      }
    });

  const pinch = Gesture.Pinch()
    .onBegin(() => {
      pinchStartScale.value = scale.value;
    })
    .onUpdate((event) => {
      const nextScale = clamp(pinchStartScale.value * event.scale, MIN_SCALE, MAX_SCALE);
      scale.value = nextScale;

      const scaledW = worldWidth.value * nextScale;
      const scaledH = worldHeight.value * nextScale;
      const maxX = Math.max(0, ((scaledW - viewportWidth.value) / 2) * PAN_BOUNDARY_RELAX);
      const maxY = Math.max(0, ((scaledH - viewportHeight.value) / 2) * PAN_BOUNDARY_RELAX);

      offsetX.value = clamp(offsetX.value, -maxX, maxX);
      offsetY.value = clamp(offsetY.value, -maxY, maxY);

      if (onViewportLiveChange) {
        runOnJS(publishLive)();
      }
    })
    .onEnd(() => {
      if (onSnapshotChange) {
        runOnJS(publishSnapshot)();
      }
    });

  const gesture = Gesture.Simultaneous(pan, pinch);

  const foregroundStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: offsetX.value },
      { translateY: offsetY.value },
      { scale: scale.value },
    ],
  }));

  const backgroundStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: offsetX.value * PARALLAX_RATE },
      { translateY: offsetY.value * PARALLAX_RATE },
      { scale: 1 + (scale.value - 1) * 0.72 },
    ],
  }));

  const originLeft = layout.width > 0 ? (layout.width - layout.worldWidth) / 2 : 0;
  const originTop = layout.height > 0 ? (layout.height - layout.worldHeight) / 2 : 0;
  const worldSize = { width: layout.worldWidth, height: layout.worldHeight };

  return (
    <View style={styles.viewport} onLayout={onLayout}>
      {layout.width > 0 && layout.height > 0 ? (
        <GestureDetector gesture={gesture}>
          <Animated.View style={StyleSheet.absoluteFill} collapsable={false}>
            <View
              style={{
                position: 'absolute',
                left: originLeft,
                top: originTop,
                width: layout.worldWidth,
                height: layout.worldHeight,
              }}>
              <Animated.View style={[StyleSheet.absoluteFill, backgroundStyle]}>
                {renderBackground(worldSize)}
              </Animated.View>
              <Animated.View style={[StyleSheet.absoluteFill, foregroundStyle]}>
                {renderForeground(worldSize)}
              </Animated.View>
            </View>
          </Animated.View>
        </GestureDetector>
      ) : null}
    </View>
  );
}

export const MySkyExplorableViewport = memo(MySkyExplorableViewportComponent);

const styles = StyleSheet.create({
  viewport: {
    flex: 1,
    overflow: 'hidden',
  },
});
