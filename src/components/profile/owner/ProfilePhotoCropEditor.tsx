import { Image } from 'expo-image';
import { memo, useCallback, useMemo, useRef } from 'react';
import { PanResponder, Pressable, StyleSheet, Text, View } from 'react-native';

import {
  DEFAULT_PROFILE_PHOTO_CROP_TRANSFORM,
  PROFILE_PHOTO_CROP_VIEWPORT_PX,
  clampProfilePhotoCropTransform,
  computeProfilePhotoCoverScale,
  type ProfilePhotoCropImageSize,
  type ProfilePhotoCropTransform,
} from '@/identity/profilePhotoCropTypes';
import { Fonts } from '@/constants/theme';

interface ProfilePhotoCropEditorProps {
  sourceUri: string;
  imageSize: ProfilePhotoCropImageSize | null;
  transform: ProfilePhotoCropTransform;
  onImageSize: (size: ProfilePhotoCropImageSize) => void;
  onTransformChange: (next: ProfilePhotoCropTransform) => void;
  onReset: () => void;
  accessibilityLabel: string;
}

function ProfilePhotoCropEditorComponent({
  sourceUri,
  imageSize,
  transform,
  onImageSize,
  onTransformChange,
  onReset,
  accessibilityLabel,
}: ProfilePhotoCropEditorProps) {
  const transformRef = useRef(transform);
  transformRef.current = transform;
  const dragStart = useRef({ x: 0, y: 0 });

  const coverScale = useMemo(
    () => (imageSize ? computeProfilePhotoCoverScale(imageSize) : 1),
    [imageSize],
  );
  const displayScale = coverScale * transform.userScale;
  const layout = useMemo(() => {
    if (!imageSize) {
      return { width: PROFILE_PHOTO_CROP_VIEWPORT_PX, height: PROFILE_PHOTO_CROP_VIEWPORT_PX };
    }
    return {
      width: imageSize.width * displayScale,
      height: imageSize.height * displayScale,
    };
  }, [displayScale, imageSize]);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: () => {
          dragStart.current = {
            x: transformRef.current.offsetX,
            y: transformRef.current.offsetY,
          };
        },
        onPanResponderMove: (_, gesture) => {
          onTransformChange(
            clampProfilePhotoCropTransform({
              ...transformRef.current,
              offsetX: dragStart.current.x + gesture.dx,
              offsetY: dragStart.current.y + gesture.dy,
            }),
          );
        },
      }),
    [onTransformChange],
  );

  const zoomBy = useCallback(
    (delta: number) => {
      onTransformChange(
        clampProfilePhotoCropTransform({
          ...transformRef.current,
          userScale: transformRef.current.userScale + delta,
        }),
      );
    },
    [onTransformChange],
  );

  const imageLeft = PROFILE_PHOTO_CROP_VIEWPORT_PX / 2 - layout.width / 2 + transform.offsetX;
  const imageTop = PROFILE_PHOTO_CROP_VIEWPORT_PX / 2 - layout.height / 2 + transform.offsetY;

  return (
    <View style={styles.wrap}>
      <View
        style={styles.viewport}
        accessibilityLabel={accessibilityLabel}
        accessibilityRole="image"
        {...panResponder.panHandlers}>
        <Image
          source={{ uri: sourceUri }}
          style={{
            position: 'absolute',
            width: layout.width,
            height: layout.height,
            left: imageLeft,
            top: imageTop,
          }}
          contentFit="fill"
          onLoad={(event) => {
            const w = event.source.width;
            const h = event.source.height;
            if (w > 0 && h > 0) {
              onImageSize({ width: w, height: h });
            }
          }}
        />
        <View style={styles.guideRing} pointerEvents="none" />
      </View>
      <View style={styles.controls}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Zoom out"
          onPress={() => zoomBy(-0.12)}
          style={styles.zoomBtn}>
          <Text style={styles.zoomText}>−</Text>
        </Pressable>
        <Text style={styles.hint}>Drag to reposition</Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Zoom in"
          onPress={() => zoomBy(0.12)}
          style={styles.zoomBtn}>
          <Text style={styles.zoomText}>+</Text>
        </Pressable>
      </View>
      <Pressable accessibilityRole="button" accessibilityLabel="Reset crop" onPress={onReset} style={styles.reset}>
        <Text style={styles.resetText}>Reset</Text>
      </Pressable>
    </View>
  );
}

export const ProfilePhotoCropEditor = memo(ProfilePhotoCropEditorComponent);

export { DEFAULT_PROFILE_PHOTO_CROP_TRANSFORM };

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    gap: 8,
    marginVertical: 6,
  },
  viewport: {
    width: PROFILE_PHOTO_CROP_VIEWPORT_PX,
    height: PROFILE_PHOTO_CROP_VIEWPORT_PX,
    borderRadius: PROFILE_PHOTO_CROP_VIEWPORT_PX / 2,
    overflow: 'hidden',
    backgroundColor: 'rgba(8, 8, 24, 0.85)',
    borderWidth: 2,
    borderColor: 'rgba(232, 200, 114, 0.45)',
  },
  guideRing: {
    ...StyleSheet.absoluteFill,
    borderRadius: PROFILE_PHOTO_CROP_VIEWPORT_PX / 2,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.22)',
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  zoomBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(167, 139, 250, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(8, 8, 24, 0.55)',
  },
  zoomText: {
    fontFamily: Fonts.sans,
    fontSize: 18,
    fontWeight: '600',
    color: 'rgba(248, 244, 236, 0.92)',
    lineHeight: 20,
  },
  hint: {
    fontFamily: Fonts.sans,
    fontSize: 11,
    color: 'rgba(235, 228, 248, 0.62)',
  },
  reset: {
    minHeight: 32,
    paddingHorizontal: 10,
    justifyContent: 'center',
  },
  resetText: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(232, 200, 114, 0.88)',
  },
});
