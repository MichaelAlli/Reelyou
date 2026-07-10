import { Image } from 'expo-image';
import { memo, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
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

function SplashArtworkBackgroundComponent() {
  const opacity = useSharedValue<number>(0);
  const scale = useSharedValue<number>(ReelyouMotionValues.backgroundZoomMin);
  const translateY = useSharedValue<number>(0);

  useEffect(() => {
    opacity.value = withTiming(1, {
      duration: ReelyouMotion.fadeIn + 300,
      easing: ReelyouEasing.out,
    });

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
        withTiming(ReelyouMotionValues.backgroundDriftY * 0.35, { duration: half, easing: ReelyouEasing.inOut }),
      ),
      -1,
      true,
    );
  }, [opacity, scale, translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }, { translateY: translateY.value }],
  }));

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.artFrame, animatedStyle]}>
        <Image
          source={SplashAssets.approved}
          style={styles.art}
          contentFit="cover"
          accessibilityLabel="REELYOU splash artwork"
        />
      </Animated.View>
    </View>
  );
}

export const SplashArtworkBackground = memo(SplashArtworkBackgroundComponent);

/** @deprecated Use SplashArtworkBackground — kept for import compatibility. */
export const SplashCelestialBackground = SplashArtworkBackground;

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFill,
    backgroundColor: SplashColors.navyDeep,
    overflow: 'hidden',
  },
  artFrame: {
    ...StyleSheet.absoluteFill,
  },
  art: {
    width: '100%',
    height: '100%',
  },
});
