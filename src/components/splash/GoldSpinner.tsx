import { memo, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { ReelyouMotion } from '@/constants/animation';
import { SplashColors } from '@/constants/splashTheme';

function GoldSpinnerComponent() {
  const rotation = useSharedValue<number>(0);

  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, {
        duration: ReelyouMotion.spinnerRotate,
        easing: Easing.linear,
      }),
      -1,
      false,
    );
  }, [rotation]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  return (
    <View style={styles.wrap}>
      <View style={styles.glowHalo} />
      <Animated.View style={[styles.spinner, animatedStyle]}>
        <View style={styles.arc} />
        <View style={styles.spark} />
      </Animated.View>
    </View>
  );
}

export const GoldSpinner = memo(GoldSpinnerComponent);

const SPINNER_SIZE = 26;

const styles = StyleSheet.create({
  wrap: {
    width: SPINNER_SIZE + 14,
    height: SPINNER_SIZE + 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glowHalo: {
    position: 'absolute',
    width: SPINNER_SIZE + 8,
    height: SPINNER_SIZE + 8,
    borderRadius: (SPINNER_SIZE + 8) / 2,
    backgroundColor: 'rgba(212, 175, 55, 0.06)',
    shadowColor: SplashColors.goldMetallic,
    shadowOpacity: 0.45,
    shadowRadius: 7,
  },
  spinner: {
    width: SPINNER_SIZE,
    height: SPINNER_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  arc: {
    position: 'absolute',
    width: SPINNER_SIZE,
    height: SPINNER_SIZE,
    borderRadius: SPINNER_SIZE / 2,
    borderWidth: 1,
    borderColor: 'transparent',
    borderTopColor: 'rgba(212, 175, 55, 0.75)',
    borderRightColor: 'rgba(212, 175, 55, 0.45)',
    borderBottomColor: 'rgba(212, 175, 55, 0.12)',
    borderLeftColor: 'rgba(212, 175, 55, 0.08)',
  },
  spark: {
    position: 'absolute',
    right: 0,
    top: SPINNER_SIZE / 2 - 2,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: SplashColors.goldSpinnerHead,
    shadowColor: SplashColors.goldBright,
    shadowOpacity: 1,
    shadowRadius: 5,
  },
});
