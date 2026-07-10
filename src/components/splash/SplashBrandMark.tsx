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
  const shimmerOpacity = useSharedValue<number>(ReelyouMotionValues.shimmerOpacityMin);

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

    const shimmerQuarter = ReelyouMotion.logoShimmer / 4;
    shimmerOpacity.value = withDelay(
      SplashAnimation.logoFadeDelay + SplashAnimation.logoFadeIn,
      withRepeat(
        withSequence(
          withTiming(ReelyouMotionValues.shimmerOpacityMin, { duration: shimmerQuarter * 2.8, easing: ReelyouEasing.inOut }),
          withTiming(ReelyouMotionValues.shimmerOpacityMax, { duration: shimmerQuarter * 0.45, easing: ReelyouEasing.out }),
          withTiming(ReelyouMotionValues.shimmerOpacityMin, { duration: shimmerQuarter * 0.75, easing: ReelyouEasing.inOut }),
        ),
        -1,
        false,
      ),
    );
  }, [glowOpacity, opacity, shimmerOpacity, translateY]);

  const brandStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  const shimmerStyle = useAnimatedStyle(() => ({
    opacity: shimmerOpacity.value,
  }));

  return (
    <View
      pointerEvents="none"
      style={[styles.container, { top: screenHeight * SPLASH_LAYOUT.brandCenterY - brandHalf }]}>
      <Animated.View
        style={[styles.brand, brandStyle, { paddingTop: SPLASH_LAYOUT.brandTopPadding }]}>
        <View style={styles.logoWrap}>
          <Animated.View style={[styles.logoBloomOuter, glowStyle]} />
          <Animated.View style={[styles.logoBloomInner, glowStyle]} />
          <Animated.View style={[styles.logoShimmer, shimmerStyle]} />
          <View style={styles.logoMark}>
            <Text style={styles.logoR}>R</Text>
            <Text style={styles.logoStar}>✦</Text>
          </View>
        </View>

        <Text style={styles.wordmark}>
          <Text style={styles.reel}>REEL</Text>
          <Text style={styles.you}>YOU</Text>
        </Text>

        <View style={styles.dividerRow}>
          <View style={styles.dividerFade} />
          <View style={styles.dividerLine} />
          <Text style={styles.dividerStar}>✦</Text>
          <View style={styles.dividerLine} />
          <View style={styles.dividerFade} />
        </View>

        <Text style={styles.tagline}>SHARE. GROW. CONTRIBUTE. BECOME.</Text>
      </Animated.View>
    </View>
  );
}

export const SplashBrandMark = memo(SplashBrandMarkComponent);

const LOGO_SIZE = 72;

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 5,
    overflow: 'visible',
  },
  brand: {
    alignItems: 'center',
    backgroundColor: 'transparent',
    width: '78%',
    maxWidth: 300,
    overflow: 'visible',
  },
  logoWrap: {
    width: LOGO_SIZE + 24,
    height: LOGO_SIZE + 24,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'visible',
  },
  logoBloomOuter: {
    position: 'absolute',
    width: LOGO_SIZE + 18,
    height: LOGO_SIZE + 18,
    borderRadius: (LOGO_SIZE + 18) / 2,
    backgroundColor: SplashColors.goldBloom,
    shadowColor: SplashColors.goldBright,
    shadowOpacity: 0.7,
    shadowRadius: 24,
  },
  logoBloomInner: {
    position: 'absolute',
    width: LOGO_SIZE + 4,
    height: LOGO_SIZE + 4,
    borderRadius: (LOGO_SIZE + 4) / 2,
    backgroundColor: SplashColors.goldGlow,
    shadowColor: SplashColors.goldMetallic,
    shadowOpacity: 0.6,
    shadowRadius: 14,
  },
  logoShimmer: {
    position: 'absolute',
    width: LOGO_SIZE - 8,
    height: LOGO_SIZE - 8,
    borderRadius: (LOGO_SIZE - 8) / 2,
    backgroundColor: 'rgba(255, 228, 165, 0.32)',
    shadowColor: '#FFF2C8',
    shadowOpacity: 0.85,
    shadowRadius: 10,
  },
  logoMark: {
    width: LOGO_SIZE,
    height: LOGO_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'visible',
  },
  logoR: {
    fontFamily: Fonts.sans,
    fontSize: 54,
    fontWeight: '300',
    fontStyle: 'italic',
    color: SplashColors.goldMetallic,
    textShadowColor: 'rgba(212, 175, 55, 0.55)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 12,
    includeFontPadding: false,
    lineHeight: 58,
  },
  logoStar: {
    position: 'absolute',
    top: 6,
    right: 8,
    fontSize: 8,
    color: SplashColors.goldBright,
  },
  wordmark: {
    marginTop: SplashSpacing.sm,
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
    color: SplashColors.goldBright,
    textShadowColor: 'rgba(232, 200, 114, 0.45)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 7,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SplashSpacing.sm + 4,
    width: '96%',
    maxWidth: 270,
  },
  dividerFade: {
    width: 20,
    height: 0.5,
    backgroundColor: 'rgba(201, 169, 98, 0.1)',
  },
  dividerLine: {
    flex: 1,
    height: 0.5,
    backgroundColor: 'rgba(212, 175, 55, 0.5)',
  },
  dividerStar: {
    fontSize: 6,
    color: SplashColors.goldChampagne,
    marginHorizontal: 7,
  },
  tagline: {
    ...SplashTypography.tagline,
    marginTop: SplashSpacing.sm + 2,
    textAlign: 'center',
  },
});
