import { memo, useEffect } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { ReelyouEasing, ReelyouMotion, ReelyouMotionValues } from '@/constants/animation';
import { SplashAssets } from '@/constants/splashAssets';
import { SplashColors } from '@/constants/splashTheme';

function SplashCelestialBackgroundComponent() {
  const scale = useSharedValue<number>(ReelyouMotionValues.backgroundZoomMin);
  const translateY = useSharedValue<number>(0);

  useEffect(() => {
    const half = ReelyouMotion.backgroundZoom / 2;

    scale.value = withRepeat(
      withSequence(
        withTiming(ReelyouMotionValues.backgroundZoomMax, {
          duration: half,
          easing: ReelyouEasing.inOut,
        }),
        withTiming(ReelyouMotionValues.backgroundZoomMin, {
          duration: half,
          easing: ReelyouEasing.inOut,
        }),
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

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { translateY: translateY.value }],
  }));

  return (
    <View style={styles.container}>
      <View style={styles.skyBase} />
      <Animated.View style={[styles.artFrame, animatedStyle]}>
        <Image
          source={SplashAssets.celestialReference}
          style={styles.art}
          resizeMode="cover"
          accessibilityLabel="REELYOU celestial splash background"
        />
      </Animated.View>
    </View>
  );
}

export const SplashCelestialBackground = memo(SplashCelestialBackgroundComponent);

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFill,
    backgroundColor: SplashColors.navyDeep,
    overflow: 'hidden',
  },
  skyBase: {
    ...StyleSheet.absoluteFill,
    backgroundColor: SplashColors.navyMid,
  },
  artFrame: {
    ...StyleSheet.absoluteFill,
  },
  art: {
    width: '100%',
    height: '100%',
  },
});
