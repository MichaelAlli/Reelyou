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

import { ReelyouEasing, ReelyouMotion, ReelyouMotionValues } from '@/constants/animation';
import { SPLASH_RING, SPLASH_RING_STARS, type RingStar } from '@/constants/splashScene';
import { SplashColors } from '@/constants/splashTheme';

const { width, height } = Dimensions.get('window');

const RingDot = memo(function RingDot(star: RingStar) {
  const opacity = useSharedValue<number>(0.4);
  const scale = useSharedValue<number>(1);

  useEffect(() => {
    const half = ReelyouMotion.glowPulse / 2;
    const delay = star.isHero ? 0 : (parseInt(star.id.replace('ring', ''), 10) % 9) * 160;

    opacity.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(star.isHero ? 1 : 0.82, { duration: half, easing: ReelyouEasing.inOut }),
          withTiming(star.isHero ? 0.6 : 0.32, { duration: half, easing: ReelyouEasing.inOut }),
        ),
        -1,
        false,
      ),
    );

    if (star.isHero) {
      scale.value = withRepeat(
        withSequence(
          withTiming(1.4, { duration: half, easing: ReelyouEasing.inOut }),
          withTiming(1, { duration: half, easing: ReelyouEasing.inOut }),
        ),
        -1,
        false,
      );
    }
  }, [opacity, scale, star.id, star.isHero]);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  const dotSize = star.isHero ? 7 : star.size;

  return (
    <>
      {star.isHero && (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.heroFlareH,
            style,
            {
              left: star.x * width - 18,
              top: star.y * height - 1,
            },
          ]}
        />
      )}
      {star.isHero && (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.heroFlareV,
            style,
            {
              left: star.x * width - 1,
              top: star.y * height - 18,
            },
          ]}
        />
      )}
      <Animated.View
        pointerEvents="none"
        style={[
          star.isHero ? styles.hero : styles.dot,
          style,
          {
            left: star.x * width - dotSize / 2,
            top: star.y * height - dotSize / 2,
            width: dotSize,
            height: dotSize,
            borderRadius: dotSize / 2,
          },
        ]}
      />
    </>
  );
});

function SplashCelestialRingComponent() {
  const ringGlow = useSharedValue<number>(ReelyouMotionValues.glowOpacityMin);
  const sparkAngle = useSharedValue<number>(0);

  useEffect(() => {
    const half = ReelyouMotion.glowPulse / 2;
    ringGlow.value = withRepeat(
      withSequence(
        withTiming(ReelyouMotionValues.glowOpacityMax * 0.5, { duration: half, easing: ReelyouEasing.inOut }),
        withTiming(ReelyouMotionValues.glowOpacityMin, { duration: half, easing: ReelyouEasing.inOut }),
      ),
      -1,
      false,
    );

    sparkAngle.value = withRepeat(
      withTiming(Math.PI * 2, { duration: 20000, easing: ReelyouEasing.linear }),
      -1,
      false,
    );
  }, [ringGlow, sparkAngle]);

  const glowStyle = useAnimatedStyle(() => ({ opacity: ringGlow.value }));

  const sparkStyle = useAnimatedStyle(() => {
    const a = sparkAngle.value - Math.PI / 2;
    const x = SPLASH_RING.cx + Math.cos(a) * SPLASH_RING.rx;
    const y = SPLASH_RING.cy + Math.sin(a) * SPLASH_RING.ry;
    return {
      transform: [{ translateX: x * width - 2.5 }, { translateY: y * height - 2.5 }],
    };
  });

  const ringW = SPLASH_RING.rx * 2 * width + width * 0.06;
  const ringH = SPLASH_RING.ry * 2 * height + height * 0.04;

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <Animated.View
        style={[
          styles.ringGlow,
          glowStyle,
          {
            left: SPLASH_RING.cx * width - ringW / 2,
            top: SPLASH_RING.cy * height - ringH / 2,
            width: ringW,
            height: ringH,
          },
        ]}
      />
      {SPLASH_RING_STARS.map((star) => (
        <RingDot key={star.id} {...star} />
      ))}
      <Animated.View style={[styles.sparkTraveler, sparkStyle]} />
    </View>
  );
}

export const SplashCelestialRing = memo(SplashCelestialRingComponent);

const styles = StyleSheet.create({
  ringGlow: {
    position: 'absolute',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(245, 200, 100, 0.1)',
    backgroundColor: 'rgba(245, 200, 100, 0.025)',
  },
  dot: {
    position: 'absolute',
    backgroundColor: SplashColors.goldBright,
    shadowColor: SplashColors.goldBright,
    shadowOpacity: 0.85,
    shadowRadius: 5,
  },
  hero: {
    position: 'absolute',
    backgroundColor: SplashColors.white,
    shadowColor: SplashColors.goldBright,
    shadowOpacity: 1,
    shadowRadius: 14,
  },
  heroFlareH: {
    position: 'absolute',
    width: 36,
    height: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.55)',
    shadowColor: SplashColors.goldBright,
    shadowOpacity: 0.9,
    shadowRadius: 8,
  },
  heroFlareV: {
    position: 'absolute',
    width: 2,
    height: 36,
    backgroundColor: 'rgba(255, 255, 255, 0.55)',
    shadowColor: SplashColors.goldBright,
    shadowOpacity: 0.9,
    shadowRadius: 8,
  },
  sparkTraveler: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: SplashColors.goldBright,
    shadowColor: SplashColors.goldBright,
    shadowOpacity: 1,
    shadowRadius: 7,
  },
});
