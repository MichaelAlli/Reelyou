import { memo, useEffect } from 'react';
import { StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { ReelyouEasing, ReelyouMotion, ReelyouMotionValues } from '@/constants/animation';
import { SPLASH_LAYOUT } from '@/constants/splashScene';
import { SplashAnimation, SplashColors, SplashSpacing, SplashTypography } from '@/constants/splashTheme';
import { Fonts } from '@/constants/theme';

function SplashBrandMarkComponent() {
  const { height: screenHeight } = useWindowDimensions();
  const brandHalf = screenHeight * SPLASH_LAYOUT.brandBlockHalfRatio;
  const opacity = useSharedValue<number>(0);
  const translateY = useSharedValue<number>(ReelyouMotionValues.logoLiftDistance);
  const glowOpacity = useSharedValue<number>(ReelyouMotionValues.glowOpacityMin);

  useEffect(() => {
    opacity.value = withDelay(
      SplashAnimation.logoFadeDelay,
      withTiming(1, { duration: SplashAnimation.logoFadeIn, easing: ReelyouEasing.out }),
    );

    translateY.value = withDelay(
      SplashAnimation.logoFadeDelay,
      withTiming(0, { duration: SplashAnimation.logoFadeIn, easing: ReelyouEasing.out }),
    );

    const glowHalf = SplashAnimation.glowPulse / 2;
    glowOpacity.value = withDelay(
      SplashAnimation.logoFadeDelay + SplashAnimation.logoFadeIn,
      withRepeat(
        withSequence(
          withTiming(ReelyouMotionValues.glowOpacityMax, { duration: glowHalf, easing: ReelyouEasing.inOut }),
          withTiming(ReelyouMotionValues.glowOpacityMin, { duration: glowHalf, easing: ReelyouEasing.inOut }),
        ),
        -1,
        false,
      ),
    );
  }, [glowOpacity, opacity, translateY]);

  const brandStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  return (
    <View
      pointerEvents="none"
      style={[styles.container, { top: screenHeight * SPLASH_LAYOUT.brandCenterY - brandHalf }]}>
      <Animated.View style={[styles.brand, brandStyle]}>
        <Animated.View style={[styles.logoGlow, glowStyle]} />
        <View style={styles.logoMark}>
          <Text style={styles.logoR}>R</Text>
          <Text style={styles.logoStar}>✦</Text>
        </View>
        <Text style={styles.wordmark}>
          <Text style={styles.reel}>REEL</Text>
          <Text style={styles.you}>YOU</Text>
        </Text>
        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerStar}>✦</Text>
          <View style={styles.dividerLine} />
        </View>
        <Text style={styles.tagline}>SHARE. GROW. CONTRIBUTE. BECOME.</Text>
      </Animated.View>
    </View>
  );
}

export const SplashBrandMark = memo(SplashBrandMarkComponent);

const LOGO_SIZE = 68;

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 5,
  },
  brand: {
    alignItems: 'center',
    backgroundColor: 'transparent',
    width: '72%',
    maxWidth: 280,
  },
  logoGlow: {
    position: 'absolute',
    top: 0,
    width: LOGO_SIZE,
    height: LOGO_SIZE,
    borderRadius: LOGO_SIZE / 2,
    backgroundColor: SplashColors.goldGlow,
    shadowColor: SplashColors.goldMetallic,
    shadowOpacity: 0.65,
    shadowRadius: 16,
  },
  logoMark: {
    width: LOGO_SIZE,
    height: LOGO_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoR: {
    fontFamily: Fonts.sans,
    fontSize: 50,
    fontWeight: '300',
    fontStyle: 'italic',
    color: SplashColors.goldMetallic,
    textShadowColor: 'rgba(212, 175, 55, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 10,
  },
  logoStar: {
    position: 'absolute',
    top: 8,
    right: 10,
    fontSize: 8,
    color: SplashColors.goldBright,
  },
  wordmark: {
    marginTop: SplashSpacing.xs + 2,
    textAlign: 'center',
  },
  reel: {
    ...SplashTypography.wordmark,
    fontWeight: '300',
    color: SplashColors.white,
  },
  you: {
    ...SplashTypography.wordmark,
    fontWeight: '500',
    color: SplashColors.goldMetallic,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SplashSpacing.sm + 4,
    gap: SplashSpacing.sm,
    width: '100%',
  },
  dividerLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(201, 169, 98, 0.5)',
  },
  dividerStar: {
    fontSize: 6,
    color: SplashColors.goldChampagne,
  },
  tagline: {
    ...SplashTypography.tagline,
    marginTop: SplashSpacing.sm + 2,
    textAlign: 'center',
  },
});
