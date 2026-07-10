import { memo, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { ReelyouEasing, ReelyouMotion } from '@/constants/animation';
import { SplashColors } from '@/constants/splashTheme';

const SPINNER_SIZE = 32;
const RING_RADIUS = SPINNER_SIZE / 2;

function GoldSpinnerComponent() {
  const rotation = useSharedValue<number>(0);
  const bloom = useSharedValue<number>(0.32);
  const sparkleScale = useSharedValue<number>(1);

  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, {
        duration: ReelyouMotion.spinnerRotate,
        easing: Easing.inOut(Easing.sin),
      }),
      -1,
      false,
    );

    const pulseHalf = ReelyouMotion.glowPulse / 2;
    bloom.value = withRepeat(
      withSequence(
        withTiming(0.58, { duration: pulseHalf, easing: ReelyouEasing.inOut }),
        withTiming(0.28, { duration: pulseHalf, easing: ReelyouEasing.inOut }),
      ),
      -1,
      false,
    );

    sparkleScale.value = withRepeat(
      withSequence(
        withTiming(1.15, { duration: pulseHalf * 0.6, easing: ReelyouEasing.inOut }),
        withTiming(0.9, { duration: pulseHalf * 0.4, easing: ReelyouEasing.inOut }),
      ),
      -1,
      false,
    );
  }, [bloom, rotation, sparkleScale]);

  const spinStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const bloomStyle = useAnimatedStyle(() => ({
    opacity: bloom.value,
  }));

  const sparkleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: sparkleScale.value }],
  }));

  return (
    <View style={styles.wrap}>
      <Animated.View style={[styles.bloomOuter, bloomStyle]} />
      <Animated.View style={[styles.bloomInner, bloomStyle]} />

      <View style={styles.trackRing} />

      <Animated.View style={[styles.spinGroup, spinStyle]}>
        <View style={styles.metallicArc} />
        <Animated.View style={[styles.travelSparkle, sparkleStyle]} />
      </Animated.View>
    </View>
  );
}

export const GoldSpinner = memo(GoldSpinnerComponent);

const styles = StyleSheet.create({
  wrap: {
    width: SPINNER_SIZE + 20,
    height: SPINNER_SIZE + 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bloomOuter: {
    position: 'absolute',
    width: SPINNER_SIZE + 16,
    height: SPINNER_SIZE + 16,
    borderRadius: (SPINNER_SIZE + 16) / 2,
    backgroundColor: 'rgba(212, 175, 55, 0.04)',
    shadowColor: SplashColors.goldMetallic,
    shadowOpacity: 0.55,
    shadowRadius: 14,
  },
  bloomInner: {
    position: 'absolute',
    width: SPINNER_SIZE + 6,
    height: SPINNER_SIZE + 6,
    borderRadius: (SPINNER_SIZE + 6) / 2,
    backgroundColor: 'rgba(255, 215, 140, 0.03)',
    shadowColor: SplashColors.goldBright,
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  trackRing: {
    position: 'absolute',
    width: SPINNER_SIZE,
    height: SPINNER_SIZE,
    borderRadius: RING_RADIUS,
    borderWidth: 0.5,
    borderColor: 'rgba(212, 175, 55, 0.16)',
    backgroundColor: 'transparent',
  },
  spinGroup: {
    width: SPINNER_SIZE,
    height: SPINNER_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metallicArc: {
    position: 'absolute',
    width: SPINNER_SIZE,
    height: SPINNER_SIZE,
    borderRadius: RING_RADIUS,
    borderWidth: 0.5,
    borderColor: 'transparent',
    borderTopColor: 'rgba(228, 198, 118, 0.92)',
    borderRightColor: 'rgba(200, 165, 80, 0.55)',
    borderBottomColor: 'rgba(160, 130, 55, 0.08)',
    borderLeftColor: 'rgba(140, 115, 48, 0.04)',
    shadowColor: SplashColors.goldMetallic,
    shadowOpacity: 0.35,
    shadowRadius: 4,
  },
  travelSparkle: {
    position: 'absolute',
    top: -1,
    left: SPINNER_SIZE / 2 - 2,
    width: 3.5,
    height: 3.5,
    borderRadius: 1.75,
    backgroundColor: 'rgba(240, 210, 140, 0.95)',
    shadowColor: SplashColors.goldBright,
    shadowOpacity: 0.85,
    shadowRadius: 5,
  },
});
