import { memo, useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { ReelyouEasing, ReelyouMotion, ReelyouMotionValues } from '@/constants/animation';
import { SplashColors } from '@/constants/splashTheme';

/** Subtle breathing light aligned with the horizon in the approved background art. */
function SunriseGlowComponent() {
  const opacity = useSharedValue<number>(ReelyouMotionValues.sunriseOpacityMin);

  useEffect(() => {
    const half = ReelyouMotion.sunriseBreath / 2;
    opacity.value = withRepeat(
      withSequence(
        withTiming(ReelyouMotionValues.sunriseOpacityMax, { duration: half, easing: ReelyouEasing.inOut }),
        withTiming(ReelyouMotionValues.sunriseOpacityMin, { duration: half, easing: ReelyouEasing.inOut }),
      ),
      -1,
      false,
    );
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View pointerEvents="none" style={[styles.horizon, animatedStyle]} />
  );
}

export const SunriseGlow = memo(SunriseGlowComponent);

const styles = StyleSheet.create({
  horizon: {
    position: 'absolute',
    alignSelf: 'center',
    width: '55%',
    bottom: '22%',
    height: 56,
    borderRadius: 999,
    backgroundColor: SplashColors.sunriseGlow,
    zIndex: 1,
  },
});
