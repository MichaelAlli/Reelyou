import { memo, useEffect } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { ReelyouEasing, ReelyouMotion, ReelyouMotionValues } from '@/constants/animation';
import { SplashColors, SplashStars } from '@/constants/splashTheme';

type StarSpec = (typeof SplashStars)[number];

const TwinkleStar = memo(function TwinkleStar({ x, y, size, delay, duration }: StarSpec) {
  const { width, height } = useWindowDimensions();
  const opacity = useSharedValue<number>(ReelyouMotionValues.starOpacityMin);

  useEffect(() => {
    const half = duration / 2;
    opacity.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(ReelyouMotionValues.starOpacityMax, { duration: half, easing: ReelyouEasing.inOut }),
          withTiming(ReelyouMotionValues.starOpacityMin, { duration: half, easing: ReelyouEasing.inOut }),
        ),
        -1,
        false,
      ),
    );
  }, [delay, duration, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  if (y > 0.52) {
    return null;
  }

  return (
    <Animated.View
      style={[
        styles.star,
        animatedStyle,
        {
          left: x * width,
          top: y * height,
          width: size,
          height: size,
          borderRadius: size / 2,
        },
      ]}
    />
  );
});

function StarShimmerLayerComponent() {
  const parallax = useSharedValue<number>(0);

  useEffect(() => {
    const half = ReelyouMotion.backgroundZoom / 2;
    const amount = ReelyouMotionValues.backgroundDriftY * 0.25;

    parallax.value = withRepeat(
      withSequence(
        withTiming(-amount, { duration: half, easing: ReelyouEasing.inOut }),
        withTiming(amount * 0.35, { duration: half, easing: ReelyouEasing.inOut }),
      ),
      -1,
      true,
    );
  }, [parallax]);

  const parallaxStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: parallax.value }],
  }));

  return (
    <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, parallaxStyle]}>
      {SplashStars.map((star) => (
        <TwinkleStar key={star.id} {...star} />
      ))}
    </Animated.View>
  );
}

export const StarShimmerLayer = memo(StarShimmerLayerComponent);

const styles = StyleSheet.create({
  star: {
    position: 'absolute',
    backgroundColor: SplashColors.white,
    shadowColor: SplashColors.goldBright,
    shadowOpacity: 0.28,
    shadowRadius: 2.5,
  },
});
