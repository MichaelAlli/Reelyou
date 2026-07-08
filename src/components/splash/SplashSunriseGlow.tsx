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
import { SPLASH_SUNRISE } from '@/constants/splashScene';
import { SplashColors } from '@/constants/splashTheme';

const RAY_COUNT = 11;

function SplashSunriseGlowComponent() {
  const { width, height } = useWindowDimensions();
  const bloom = useSharedValue<number>(ReelyouMotionValues.sunriseOpacityMin);
  const core = useSharedValue<number>(ReelyouMotionValues.sunriseOpacityMin * 1.5);

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

    core.value = withRepeat(
      withSequence(
        withTiming(ReelyouMotionValues.sunriseOpacityMax * 1.55, { duration: half, easing: ReelyouEasing.inOut }),
        withTiming(ReelyouMotionValues.sunriseOpacityMin * 1.15, { duration: half, easing: ReelyouEasing.inOut }),
      ),
      -1,
      false,
    );
  }, [bloom, core]);

  const bloomStyle = useAnimatedStyle(() => ({ opacity: bloom.value }));
  const coreStyle = useAnimatedStyle(() => ({ opacity: core.value }));

  const coreSize = width * SPLASH_SUNRISE.coreSizeRatio;
  const innerSize = width * SPLASH_SUNRISE.innerSizeRatio;

  return (
    <View pointerEvents="none" style={styles.wrap}>
      <Animated.View
        style={[
          styles.horizonBloomWide,
          bloomStyle,
          { bottom: height * SPLASH_SUNRISE.horizonBottomRatio, width: width * 1.15, height: height * 0.26 },
        ]}
      />
      <Animated.View
        style={[
          styles.horizonBloom,
          bloomStyle,
          { bottom: height * (SPLASH_SUNRISE.horizonBottomRatio + 0.01), width: width * 0.78, height: height * 0.2 },
        ]}
      />
      <Animated.View
        style={[
          styles.sunCore,
          coreStyle,
          {
            bottom: height * SPLASH_SUNRISE.coreBottomRatio,
            width: coreSize,
            height: coreSize,
            borderRadius: coreSize / 2,
          },
        ]}
      />
      <Animated.View
        style={[
          styles.sunInner,
          coreStyle,
          {
            bottom: height * (SPLASH_SUNRISE.coreBottomRatio + 0.012),
            width: innerSize,
            height: innerSize,
            borderRadius: innerSize / 2,
          },
        ]}
      />
      {Array.from({ length: RAY_COUNT }, (_, i) => {
        const angle = -90 + (i - (RAY_COUNT - 1) / 2) * 9;
        return (
          <Animated.View
            key={`ray-${i}`}
            style={[
              styles.ray,
              bloomStyle,
              {
                bottom: height * (SPLASH_SUNRISE.coreBottomRatio + 0.025),
                height: height * 0.14,
                transform: [{ rotate: `${angle}deg` }, { translateY: -height * 0.05 }],
              },
            ]}
          />
        );
      })}
    </View>
  );
}

export const SplashSunriseGlow = memo(SplashSunriseGlowComponent);

const styles = StyleSheet.create({
  wrap: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'flex-end',
    zIndex: 1,
  },
  horizonBloomWide: {
    position: 'absolute',
    borderRadius: 999,
    backgroundColor: 'rgba(255, 120, 40, 0.14)',
  },
  horizonBloom: {
    position: 'absolute',
    borderRadius: 999,
    backgroundColor: SplashColors.sunriseGlow,
  },
  sunCore: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 210, 130, 0.4)',
    shadowColor: '#FF9830',
    shadowOpacity: 0.95,
    shadowRadius: 36,
  },
  sunInner: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 252, 240, 0.92)',
    shadowColor: '#FFFFFF',
    shadowOpacity: 0.95,
    shadowRadius: 18,
  },
  ray: {
    position: 'absolute',
    width: 2,
    backgroundColor: 'rgba(255, 185, 90, 0.1)',
    borderRadius: 2,
  },
});
