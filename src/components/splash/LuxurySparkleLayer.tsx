import { memo, useEffect } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { ReelyouEasing } from '@/constants/animation';
import { SplashColors } from '@/constants/splashTheme';

interface LuxurySparkleSpec {
  id: string;
  x: number;
  y: number;
  size: number;
  delay: number;
  cycle: number;
  gold: boolean;
}

/** Two cinematic glints — staggered so only 1–2 appear every few seconds. */
const LUXURY_SPARKLES: LuxurySparkleSpec[] = [
  { id: 'ls1', x: 0.19, y: 0.11, size: 1.5, delay: 0, cycle: 7600, gold: false },
  { id: 'ls2', x: 0.83, y: 0.39, size: 1.5, delay: 4200, cycle: 8400, gold: true },
];

const LuxurySparkle = memo(function LuxurySparkle({
  x,
  y,
  size,
  delay,
  cycle,
  gold,
}: LuxurySparkleSpec) {
  const { width, height } = useWindowDimensions();
  const opacity = useSharedValue<number>(0);

  useEffect(() => {
    const fadeIn = 1100;
    const hold = 280;
    const fadeOut = 1200;
    const idle = Math.max(4200, cycle - fadeIn - hold - fadeOut);

    opacity.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(0, { duration: idle, easing: ReelyouEasing.inOut }),
          withTiming(gold ? 0.24 : 0.2, { duration: fadeIn, easing: ReelyouEasing.out }),
          withTiming(gold ? 0.2 : 0.17, { duration: hold, easing: ReelyouEasing.inOut }),
          withTiming(0, { duration: fadeOut, easing: ReelyouEasing.inOut }),
        ),
        -1,
        false,
      ),
    );
  }, [cycle, delay, gold, opacity]);

  const style = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View
      style={[
        styles.sparkle,
        style,
        gold ? styles.sparkleGold : styles.sparkleWhite,
        {
          left: x * width - size / 2,
          top: y * height - size / 2,
          width: size,
          height: size,
          borderRadius: size / 2,
        },
      ]}
    />
  );
});

function LuxurySparkleLayerComponent() {
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {LUXURY_SPARKLES.map((sparkle) => (
        <LuxurySparkle key={sparkle.id} {...sparkle} />
      ))}
    </View>
  );
}

export const LuxurySparkleLayer = memo(LuxurySparkleLayerComponent);

const styles = StyleSheet.create({
  sparkle: {
    position: 'absolute',
  },
  sparkleGold: {
    backgroundColor: SplashColors.goldBright,
    shadowColor: SplashColors.goldBright,
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
  },
  sparkleWhite: {
    backgroundColor: 'rgba(255, 255, 255, 0.82)',
    shadowColor: SplashColors.goldChampagne,
    shadowOpacity: 0.14,
    shadowRadius: 1.5,
  },
});
