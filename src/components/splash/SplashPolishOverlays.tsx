import { memo, useEffect } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { ReelyouEasing, ReelyouMotion, ReelyouMotionValues } from '@/constants/animation';
import { SPLASH_LAYOUT } from '@/constants/splashScene';

function useParallaxDrift(multiplier: number) {
  const drift = useSharedValue<number>(0);

  useEffect(() => {
    const half = ReelyouMotion.backgroundZoom / 2;
    const amount = ReelyouMotionValues.backgroundDriftY * multiplier;

    drift.value = withRepeat(
      withSequence(
        withTiming(-amount, { duration: half, easing: ReelyouEasing.inOut }),
        withTiming(amount * 0.4, { duration: half, easing: ReelyouEasing.inOut }),
      ),
      -1,
      true,
    );
  }, [drift, multiplier]);

  return useAnimatedStyle(() => ({
    transform: [{ translateY: drift.value }],
  }));
}

/** Royal-blue luminance lift — sits over artwork, no purple tint. */
export const SplashSkyPolish = memo(function SplashSkyPolish() {
  const { width, height } = useWindowDimensions();
  const logoY = height * SPLASH_LAYOUT.brandCenterY;

  return (
    <View pointerEvents="none" style={styles.skyRoot}>
      <View style={styles.skyRoyalLift} />
      <View style={styles.skyLuminance} />
      <View style={styles.skyDepthBlue} />
      <View style={styles.contrastLift} />
      <View style={styles.goldSheen} />
      <View style={styles.ambientBloom} />
      <View
        style={[
          styles.centerDepthOuter,
          {
            top: logoY + height * 0.06,
            left: width * 0.06,
            width: width * 0.88,
            height: height * 0.34,
          },
        ]}
      />
      <View
        style={[
          styles.centerDepthInner,
          {
            top: logoY + height * 0.12,
            left: width * 0.18,
            width: width * 0.64,
            height: height * 0.22,
          },
        ]}
      />
    </View>
  );
});

const CloudEdgePolish = memo(function CloudEdgePolish() {
  const { width, height } = useWindowDimensions();
  const parallaxStyle = useParallaxDrift(1.15);
  const breathe = useSharedValue<number>(0.1);

  useEffect(() => {
    const half = ReelyouMotion.backgroundZoom / 2;
    breathe.value = withRepeat(
      withSequence(
        withTiming(0.14, { duration: half, easing: ReelyouEasing.inOut }),
        withTiming(0.1, { duration: half, easing: ReelyouEasing.inOut }),
      ),
      -1,
      false,
    );
  }, [breathe]);

  const breatheStyle = useAnimatedStyle(() => ({ opacity: breathe.value }));

  return (
    <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, parallaxStyle]}>
      <Animated.View
        style={[
          styles.cloudEdgeLeft,
          breatheStyle,
          { top: height * 0.405, width: width * 0.58, height: height * 0.17 },
        ]}
      />
      <Animated.View
        style={[
          styles.cloudEdgeRight,
          breatheStyle,
          { top: height * 0.415, right: 0, width: width * 0.56, height: height * 0.16 },
        ]}
      />
      <Animated.View
        style={[
          styles.cloudSoftLeft,
          breatheStyle,
          { top: height * 0.48, width: width * 0.42, height: height * 0.12 },
        ]}
      />
      <Animated.View
        style={[
          styles.cloudSoftRight,
          breatheStyle,
          { top: height * 0.49, right: 0, width: width * 0.4, height: height * 0.11 },
        ]}
      />
    </Animated.View>
  );
});

const SunrisePolish = memo(function SunrisePolish() {
  const { width, height } = useWindowDimensions();
  const parallaxStyle = useParallaxDrift(0.35);
  const bloom = useSharedValue<number>(ReelyouMotionValues.sunriseOpacityMin);

  useEffect(() => {
    const half = ReelyouMotion.sunriseBreath / 2;
    bloom.value = withRepeat(
      withSequence(
        withTiming(ReelyouMotionValues.sunriseOpacityMax, { duration: half, easing: ReelyouEasing.inOut }),
        withTiming(ReelyouMotionValues.sunriseOpacityMin, { duration: half, easing: ReelyouEasing.inOut }),
      ),
      -1,
      false,
    );
  }, [bloom]);

  const bloomStyle = useAnimatedStyle(() => ({ opacity: bloom.value }));

  return (
    <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, parallaxStyle]}>
      <Animated.View
        style={[
          styles.sunriseBloomWide,
          bloomStyle,
          {
            bottom: height * 0.1,
            left: width * 0.12,
            width: width * 0.76,
            height: height * 0.2,
          },
        ]}
      />
      <Animated.View
        style={[
          styles.sunriseBloomCore,
          bloomStyle,
          {
            bottom: height * 0.135,
            left: width * 0.3,
            width: width * 0.4,
            height: height * 0.12,
          },
        ]}
      />
    </Animated.View>
  );
});

function SplashPolishOverlaysComponent() {
  return (
    <View pointerEvents="none" style={styles.root}>
      <CloudEdgePolish />
      <SunrisePolish />
    </View>
  );
}

export const SplashPolishOverlays = memo(SplashPolishOverlaysComponent);

const styles = StyleSheet.create({
  skyRoot: {
    ...StyleSheet.absoluteFill,
    zIndex: 2,
  },
  root: {
    ...StyleSheet.absoluteFill,
    zIndex: 2,
  },
  skyRoyalLift: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(38, 62, 138, 0.118)',
  },
  skyLuminance: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '62%',
    backgroundColor: 'rgba(52, 78, 158, 0.08)',
  },
  skyDepthBlue: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '45%',
    backgroundColor: 'rgba(28, 48, 112, 0.064)',
  },
  centerDepthOuter: {
    position: 'absolute',
    borderRadius: 999,
    backgroundColor: 'rgba(10, 22, 54, 0.014)',
  },
  centerDepthInner: {
    position: 'absolute',
    borderRadius: 999,
    backgroundColor: 'rgba(14, 30, 68, 0.01)',
  },
  contrastLift: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(255, 248, 230, 0.024)',
  },
  goldSheen: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '48%',
    backgroundColor: 'rgba(255, 210, 130, 0.014)',
  },
  ambientBloom: {
    position: 'absolute',
    bottom: 0,
    left: '10%',
    right: '10%',
    height: '38%',
    backgroundColor: 'rgba(255, 175, 85, 0.012)',
    borderTopLeftRadius: 999,
    borderTopRightRadius: 999,
  },
  cloudEdgeLeft: {
    position: 'absolute',
    left: 0,
    borderTopLeftRadius: 120,
    borderTopRightRadius: 80,
    backgroundColor: 'rgba(255, 168, 58, 0.076)',
    shadowColor: '#FFB040',
    shadowOpacity: 0.48,
    shadowRadius: 24,
  },
  cloudEdgeRight: {
    position: 'absolute',
    borderTopLeftRadius: 80,
    borderTopRightRadius: 120,
    backgroundColor: 'rgba(255, 162, 52, 0.07)',
    shadowColor: '#FFB040',
    shadowOpacity: 0.45,
    shadowRadius: 22,
  },
  cloudSoftLeft: {
    position: 'absolute',
    left: 0,
    borderTopLeftRadius: 90,
    borderTopRightRadius: 60,
    backgroundColor: 'rgba(255, 175, 70, 0.05)',
  },
  cloudSoftRight: {
    position: 'absolute',
    borderTopLeftRadius: 60,
    borderTopRightRadius: 90,
    backgroundColor: 'rgba(255, 175, 70, 0.045)',
  },
  sunriseBloomWide: {
    position: 'absolute',
    borderRadius: 999,
    backgroundColor: 'rgba(255, 130, 45, 0.108)',
  },
  sunriseBloomCore: {
    position: 'absolute',
    borderRadius: 999,
    backgroundColor: 'rgba(255, 185, 85, 0.124)',
    shadowColor: '#FF9830',
    shadowOpacity: 0.38,
    shadowRadius: 22,
  },
});
