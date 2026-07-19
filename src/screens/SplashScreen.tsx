import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { LuxurySparkleLayer } from '@/components/splash/LuxurySparkleLayer';
import { SplashLogoShimmer } from '@/components/splash/SplashLogoShimmer';
import { SplashArtworkBackground } from '@/components/splash/SplashCelestialBackground';
import {
  SplashPolishOverlays,
  SplashSkyPolish,
} from '@/components/splash/SplashPolishOverlays';
import { StarShimmerLayer } from '@/components/splash/StarShimmerLayer';
import { ReelyouEasing } from '@/constants/animation';
import { SplashAnimation, SplashColors } from '@/constants/splashTheme';

/** Review mode: splash stays until manually continued. Set true only for local design review. */
const SPLASH_REVIEW_MODE = false;

/** Continue (Dev) appears only while review mode is enabled. */
const SHOW_DEV_CONTINUE = SPLASH_REVIEW_MODE;

export function SplashScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const screenOpacity = useSharedValue<number>(1);

  const goToWelcome = useCallback(() => {
    router.replace('/welcome' as never);
  }, [router]);

  const exitSplash = useCallback(() => {
    screenOpacity.value = withTiming(
      0,
      { duration: SplashAnimation.screenTransition, easing: ReelyouEasing.inOut },
      (finished) => {
        if (finished) {
          runOnJS(goToWelcome)();
        }
      },
    );
  }, [goToWelcome, screenOpacity]);

  useEffect(() => {
    if (SPLASH_REVIEW_MODE) {
      return;
    }

    const timer = setTimeout(exitSplash, SplashAnimation.autoTransition);
    return () => clearTimeout(timer);
  }, [exitSplash]);

  const screenStyle = useAnimatedStyle(() => ({
    opacity: screenOpacity.value,
  }));

  return (
    <Animated.View style={[styles.root, screenStyle]}>
      <StatusBar style="light" />
      <SplashArtworkBackground />
      <SplashSkyPolish />
      <SplashPolishOverlays />
      <StarShimmerLayer />
      <LuxurySparkleLayer />
      <SplashLogoShimmer />
      {SHOW_DEV_CONTINUE && (
        <Pressable
          onPress={exitSplash}
          style={[styles.devContinue, { bottom: insets.bottom + 12, right: insets.right + 12 }]}>
          <Text style={styles.devContinueText}>Continue (Dev)</Text>
        </Pressable>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: SplashColors.navyDeep,
  },
  devContinue: {
    position: 'absolute',
    zIndex: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.45)',
  },
  devContinueText: {
    color: SplashColors.goldChampagne,
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});
