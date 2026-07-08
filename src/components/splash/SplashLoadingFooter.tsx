import { memo, useEffect } from 'react';
import { StyleSheet, useWindowDimensions } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { GoldSpinner } from '@/components/splash/GoldSpinner';
import { ReelyouEasing, ReelyouMotionValues } from '@/constants/animation';
import { SPLASH_LAYOUT } from '@/constants/splashScene';
import { SplashAnimation, SplashTypography } from '@/constants/splashTheme';

function SplashLoadingFooterComponent() {
  const { height: screenHeight } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const opacity = useSharedValue<number>(0);
  const translateY = useSharedValue<number>(6);
  const textBreath = useSharedValue<number>(ReelyouMotionValues.loadingTextOpacityMax);

  useEffect(() => {
    const fadeInAt = SplashAnimation.loadingFadeDelay;

    opacity.value = withDelay(
      fadeInAt,
      withTiming(1, { duration: SplashAnimation.loadingFadeIn, easing: ReelyouEasing.out }),
    );

    translateY.value = withDelay(
      fadeInAt,
      withTiming(0, { duration: SplashAnimation.loadingFadeIn, easing: ReelyouEasing.out }),
    );

    const breathHalf = SplashAnimation.loadingTextBreath / 2;
    textBreath.value = withDelay(
      fadeInAt + SplashAnimation.loadingFadeIn,
      withRepeat(
        withSequence(
          withTiming(ReelyouMotionValues.loadingTextOpacityMin, {
            duration: breathHalf,
            easing: ReelyouEasing.inOut,
          }),
          withTiming(ReelyouMotionValues.loadingTextOpacityMax, {
            duration: breathHalf,
            easing: ReelyouEasing.inOut,
          }),
        ),
        -1,
        false,
      ),
    );
  }, [opacity, textBreath, translateY]);

  const containerStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  const labelStyle = useAnimatedStyle(() => ({
    opacity: textBreath.value,
  }));

  const bottom = insets.bottom + screenHeight * SPLASH_LAYOUT.loadingBottomRatio;
  const gap = screenHeight * SPLASH_LAYOUT.loadingStackGapRatio;

  return (
    <Animated.View style={[styles.container, { bottom, gap }, containerStyle]} pointerEvents="none">
      <GoldSpinner />
      <Animated.Text style={[styles.label, labelStyle]}>LOADING YOUR JOURNEY...</Animated.Text>
    </Animated.View>
  );
}

export const SplashLoadingFooter = memo(SplashLoadingFooterComponent);

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 6,
  },
  label: {
    ...SplashTypography.loadingLabel,
    textAlign: 'center',
  },
});
