import { memo, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { SplashCelestialRing } from '@/components/splash/SplashCelestialRing';
import { SplashCloudLayers } from '@/components/splash/SplashCloudLayers';
import { SplashMountains } from '@/components/splash/SplashMountains';
import { SplashSkyGradient } from '@/components/splash/SplashSkyGradient';
import { SplashStarField } from '@/components/splash/SplashStarField';
import { SplashSunriseGlow } from '@/components/splash/SplashSunriseGlow';
import { ReelyouEasing, ReelyouMotion, ReelyouMotionValues } from '@/constants/animation';
import { SplashColors } from '@/constants/splashTheme';

function SplashCelestialSceneComponent() {
  const scale = useSharedValue<number>(ReelyouMotionValues.backgroundZoomMin);
  const translateY = useSharedValue<number>(0);

  useEffect(() => {
    const half = ReelyouMotion.backgroundZoom / 2;

    scale.value = withRepeat(
      withSequence(
        withTiming(ReelyouMotionValues.backgroundZoomMax, { duration: half, easing: ReelyouEasing.inOut }),
        withTiming(ReelyouMotionValues.backgroundZoomMin, { duration: half, easing: ReelyouEasing.inOut }),
      ),
      -1,
      false,
    );

    translateY.value = withRepeat(
      withSequence(
        withTiming(-ReelyouMotionValues.backgroundDriftY, { duration: half, easing: ReelyouEasing.inOut }),
        withTiming(0, { duration: half, easing: ReelyouEasing.inOut }),
      ),
      -1,
      false,
    );
  }, [scale, translateY]);

  const cameraStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { translateY: translateY.value }],
  }));

  return (
    <View style={styles.root}>
      <Animated.View style={[styles.camera, cameraStyle]}>
        <SplashSkyGradient />
        <SplashStarField />
        <SplashSunriseGlow />
        <SplashMountains />
        <SplashCloudLayers />
        <SplashCelestialRing />
      </Animated.View>
    </View>
  );
}

export const SplashCelestialScene = memo(SplashCelestialSceneComponent);

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFill,
    backgroundColor: SplashColors.navyDeep,
    overflow: 'hidden',
  },
  camera: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
});
