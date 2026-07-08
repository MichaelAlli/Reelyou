import { memo, useEffect } from 'react';
import { Dimensions, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { ReelyouEasing } from '@/constants/animation';
import { SPLASH_STAR_FIELD, type SceneStar } from '@/constants/splashScene';

const { width, height } = Dimensions.get('window');

const FieldStar = memo(function FieldStar(star: SceneStar) {
  const opacity = useSharedValue<number>(star.peak * 0.22);
  const scale = useSharedValue<number>(1);

  useEffect(() => {
    const half = star.duration / 2;
    opacity.value = withDelay(
      star.delay,
      withRepeat(
        withSequence(
          withTiming(star.peak, { duration: half, easing: ReelyouEasing.inOut }),
          withTiming(star.peak * 0.18, { duration: half, easing: ReelyouEasing.inOut }),
        ),
        -1,
        false,
      ),
    );

    if (star.sparkle) {
      const sparkleHalf = half * 0.55;
      scale.value = withDelay(
        star.delay,
        withRepeat(
          withSequence(
            withTiming(1.8, { duration: sparkleHalf, easing: ReelyouEasing.inOut }),
            withTiming(0.8, { duration: sparkleHalf, easing: ReelyouEasing.inOut }),
            withTiming(1, { duration: sparkleHalf * 0.6, easing: ReelyouEasing.inOut }),
          ),
          -1,
          false,
        ),
      );
    }
  }, [opacity, scale, star.delay, star.duration, star.peak, star.sparkle]);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.star,
        style,
        {
          left: star.x * width - star.size / 2,
          top: star.y * height - star.size / 2,
          width: star.size,
          height: star.size,
          borderRadius: star.size / 2,
          backgroundColor: star.tint,
        },
      ]}
    />
  );
});

function SplashStarFieldComponent() {
  return (
    <>
      {SPLASH_STAR_FIELD.map((star) => (
        <FieldStar key={star.id} {...star} />
      ))}
    </>
  );
}

export const SplashStarField = memo(SplashStarFieldComponent);

const styles = StyleSheet.create({
  star: {
    position: 'absolute',
    shadowColor: '#FFFFFF',
    shadowOpacity: 0.35,
    shadowRadius: 2,
  },
});
