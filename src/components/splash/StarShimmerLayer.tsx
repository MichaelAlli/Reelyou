import { memo, useEffect } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { ReelyouEasing, ReelyouMotionValues } from '@/constants/animation';
import { SplashColors, SplashStars } from '@/constants/splashTheme';

const { width, height } = Dimensions.get('window');

type StarSpec = (typeof SplashStars)[number];

const TwinkleStar = memo(function TwinkleStar({ x, y, size, delay, duration }: StarSpec) {
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
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {SplashStars.map((star) => (
        <TwinkleStar key={star.id} {...star} />
      ))}
    </View>
  );
}

export const StarShimmerLayer = memo(StarShimmerLayerComponent);

const styles = StyleSheet.create({
  star: {
    position: 'absolute',
    backgroundColor: SplashColors.white,
    shadowColor: SplashColors.goldBright,
    shadowOpacity: 0.35,
    shadowRadius: 3,
  },
});
