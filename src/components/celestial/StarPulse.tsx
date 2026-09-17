import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { CelestialStarBloom } from '@/constants/celestialTokens';
import { CelestialStarPulseMotion as PulseMotion } from '@/constants/celestialMotion';

interface StarPulseProps {
  cx: number;
  cy: number;
  /** Ring diameter — default 72 (My Sky landing pulse). */
  size?: number;
}

/** Landing pulse ring — approved highlight arrival behavior. */
export function StarPulse({ cx, cy, size = 72 }: StarPulseProps) {
  const pulse = useSharedValue(0.55);
  const half = size / 2;

  useEffect(() => {
    pulse.value = withSequence(
      withRepeat(
        withSequence(
          withTiming(1, { duration: PulseMotion.initialPulseDurationMs }),
          withTiming(0.5, { duration: PulseMotion.initialPulseDurationMs }),
        ),
        PulseMotion.initialPulseCount,
        false,
      ),
      withRepeat(
        withSequence(
          withTiming(0.82, { duration: PulseMotion.restingPulseDurationMs }),
          withTiming(0.58, { duration: PulseMotion.restingPulseDurationMs }),
        ),
        -1,
        false,
      ),
    );
  }, [pulse]);

  const style = useAnimatedStyle(() => ({
    opacity: pulse.value,
    transform: [{ scale: 0.9 + pulse.value * 0.18 }],
  }));

  return (
    <Animated.View
      style={[
        styles.ring,
        style,
        {
          width: size,
          height: size,
          borderRadius: half,
          left: cx - half,
          top: cy - half,
        },
      ]}
      pointerEvents="none"
      accessibilityElementsHidden
    />
  );
}

const styles = StyleSheet.create({
  ring: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: CelestialStarBloom.landingPulse.ring,
    backgroundColor: CelestialStarBloom.landingPulse.ringFill,
  },
});
