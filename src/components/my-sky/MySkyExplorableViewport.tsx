import { ReactNode, memo, useCallback, useEffect, useRef, useState } from 'react';
import { LayoutChangeEvent, StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import type { MySkyViewportSnapshot } from '@/mySky/mySkyViewportSession';
import {
  MY_SKY_BOUND_SNAP_MS,
  MY_SKY_JUMP_DURATION_MS,
  MY_SKY_LIVE_PUBLISH_MS,
  MY_SKY_MAX_SCALE,
  MY_SKY_MIN_SCALE,
  MY_SKY_PAN_MIN_DISTANCE,
  MY_SKY_WORLD_FACTOR,
  applyPinchFocalOffset,
  clampOffsetToBounds,
  snapshotKey,
} from '@/mySky/mySkyViewportGestures';

interface MySkyExplorableViewportProps {
  renderWorld: (worldSize: { width: number; height: number }) => ReactNode;
  initialSnapshot?: MySkyViewportSnapshot;
  jumpSnapshot?: MySkyViewportSnapshot | null;
  onSnapshotChange?: (snapshot: MySkyViewportSnapshot) => void;
  onViewportLiveChange?: (snapshot: MySkyViewportSnapshot) => void;
  onWorldSizeChange?: (worldSize: { width: number; height: number }) => void;
  onGestureActiveChange?: (active: boolean) => void;
}

function MySkyExplorableViewportComponent({
  renderWorld,
  initialSnapshot,
  jumpSnapshot,
  onSnapshotChange,
  onViewportLiveChange,
  onWorldSizeChange,
  onGestureActiveChange,
}: MySkyExplorableViewportProps) {
  const [layout, setLayout] = useState({ width: 0, height: 0, worldWidth: 0, worldHeight: 0 });
  const lastLivePublish = useRef(0);
  const lastSyncedSnapshot = useRef('');

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
  const pinchStartOffsetX = useSharedValue(0);
  const pinchStartOffsetY = useSharedValue(0);

  useEffect(() => {
    if (!initialSnapshot) return;
    const key = snapshotKey(initialSnapshot);
    if (key === lastSyncedSnapshot.current) return;
    lastSyncedSnapshot.current = key;
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

  const setGestureActive = useCallback(
    (active: boolean) => {
      onGestureActiveChange?.(active);
    },
    [onGestureActiveChange],
  );

  useEffect(() => {
    if (!jumpSnapshot) return;
    lastSyncedSnapshot.current = snapshotKey(jumpSnapshot);
    offsetX.value = withTiming(jumpSnapshot.offsetX, {
      duration: MY_SKY_JUMP_DURATION_MS,
      easing: Easing.out(Easing.cubic),
    });
    offsetY.value = withTiming(jumpSnapshot.offsetY, {
      duration: MY_SKY_JUMP_DURATION_MS,
      easing: Easing.out(Easing.cubic),
    });
    scale.value = withTiming(
      jumpSnapshot.scale,
      { duration: MY_SKY_JUMP_DURATION_MS, easing: Easing.out(Easing.cubic) },
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
    if (now - lastLivePublish.current < MY_SKY_LIVE_PUBLISH_MS) return;
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
    .minDistance(MY_SKY_PAN_MIN_DISTANCE)
    .maxPointers(1)
    .onBegin(() => {
      panStartX.value = offsetX.value;
      panStartY.value = offsetY.value;
      if (onGestureActiveChange) {
        runOnJS(setGestureActive)(true);
      }
    })
    .onUpdate((event) => {
      const clamped = clampOffsetToBounds(
        panStartX.value + event.translationX,
        panStartY.value + event.translationY,
        worldWidth.value,
        worldHeight.value,
        viewportWidth.value,
        viewportHeight.value,
        scale.value,
      );
      offsetX.value = clamped.x;
      offsetY.value = clamped.y;

      if (onViewportLiveChange) {
        runOnJS(publishLive)();
      }
    })
    .onEnd(() => {
      const clamped = clampOffsetToBounds(
        offsetX.value,
        offsetY.value,
        worldWidth.value,
        worldHeight.value,
        viewportWidth.value,
        viewportHeight.value,
        scale.value,
      );
      if (clamped.x !== offsetX.value) {
        offsetX.value = withTiming(clamped.x, {
          duration: MY_SKY_BOUND_SNAP_MS,
          easing: Easing.out(Easing.quad),
        });
      }
      if (clamped.y !== offsetY.value) {
        offsetY.value = withTiming(clamped.y, {
          duration: MY_SKY_BOUND_SNAP_MS,
          easing: Easing.out(Easing.quad),
        });
      }
      if (onGestureActiveChange) {
        runOnJS(setGestureActive)(false);
      }
      if (onSnapshotChange) {
        runOnJS(publishSnapshot)();
      } else if (onViewportLiveChange) {
        runOnJS(publishLive)();
      }
    })
    .onFinalize(() => {
      if (onGestureActiveChange) {
        runOnJS(setGestureActive)(false);
      }
    });

  const pinch = Gesture.Pinch()
    .onBegin(() => {
      pinchStartScale.value = scale.value;
      pinchStartOffsetX.value = offsetX.value;
      pinchStartOffsetY.value = offsetY.value;
      if (onGestureActiveChange) {
        runOnJS(setGestureActive)(true);
      }
    })
    .onUpdate((event) => {
      const previousScale = scale.value;
      const nextScale = Math.min(
        MY_SKY_MAX_SCALE,
        Math.max(MY_SKY_MIN_SCALE, pinchStartScale.value * event.scale),
      );
      const focalOffset = applyPinchFocalOffset(
        event.focalX,
        event.focalY,
        viewportWidth.value,
        viewportHeight.value,
        pinchStartOffsetX.value,
        pinchStartOffsetY.value,
        pinchStartScale.value,
        nextScale,
      );
      const clamped = clampOffsetToBounds(
        focalOffset.x,
        focalOffset.y,
        worldWidth.value,
        worldHeight.value,
        viewportWidth.value,
        viewportHeight.value,
        nextScale,
      );

      scale.value = nextScale;
      offsetX.value = clamped.x;
      offsetY.value = clamped.y;

      if (previousScale !== nextScale && onViewportLiveChange) {
        runOnJS(publishLive)();
      }
    })
    .onEnd(() => {
      const clamped = clampOffsetToBounds(
        offsetX.value,
        offsetY.value,
        worldWidth.value,
        worldHeight.value,
        viewportWidth.value,
        viewportHeight.value,
        scale.value,
      );
      if (clamped.x !== offsetX.value) {
        offsetX.value = withTiming(clamped.x, {
          duration: MY_SKY_BOUND_SNAP_MS,
          easing: Easing.out(Easing.quad),
        });
      }
      if (clamped.y !== offsetY.value) {
        offsetY.value = withTiming(clamped.y, {
          duration: MY_SKY_BOUND_SNAP_MS,
          easing: Easing.out(Easing.quad),
        });
      }
      if (onGestureActiveChange) {
        runOnJS(setGestureActive)(false);
      }
      if (onSnapshotChange) {
        runOnJS(publishSnapshot)();
      }
    })
    .onFinalize(() => {
      if (onGestureActiveChange) {
        runOnJS(setGestureActive)(false);
      }
    });

  const gesture = Gesture.Simultaneous(pan, pinch);

  const worldStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: offsetX.value },
      { translateY: offsetY.value },
      { scale: scale.value },
    ],
  }));

  const originLeft = layout.width > 0 ? (layout.width - layout.worldWidth) / 2 : 0;
  const originTop = layout.height > 0 ? (layout.height - layout.worldHeight) / 2 : 0;
  const worldSize = { width: layout.worldWidth, height: layout.worldHeight };

  return (
    <View style={styles.viewport} onLayout={onLayout} testID="my-sky-viewport">
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
              <Animated.View style={[StyleSheet.absoluteFill, worldStyle]}>
                {renderWorld(worldSize)}
              </Animated.View>
            </View>
          </Animated.View>
        </GestureDetector>
      ) : null}
    </View>
  );
}

export const MySkyExplorableViewport = memo(MySkyExplorableViewportComponent);

export { MY_SKY_WORLD_FACTOR } from '@/mySky/mySkyViewportGestures';

const styles = StyleSheet.create({
  viewport: {
    flex: 1,
    overflow: 'hidden',
  },
});
