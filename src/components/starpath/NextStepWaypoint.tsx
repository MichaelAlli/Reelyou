import { memo, useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg';

interface NextStepWaypointProps {
  x: number;
  y: number;
  onPress: () => void;
}

function NextStepWaypointComponent({ x, y, onPress }: NextStepWaypointProps) {
  const pulse = useSharedValue(0);

  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 2400, easing: Easing.inOut(Easing.quad) }),
        withTiming(0, { duration: 2400, easing: Easing.inOut(Easing.quad) }),
      ),
      -1,
      false,
    );
  }, [pulse]);

  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 + pulse.value * 0.08 }],
    opacity: 0.5 + pulse.value * 0.3,
  }));

  const size = 44;

  return (
    <Pressable
      onPress={onPress}
      style={[styles.hit, { left: x - size / 2, top: y - size / 2, width: size, height: size }]}
      accessibilityRole="button"
      accessibilityLabel="Next step on your path"
      testID="next-step-waypoint"
    >
      <Animated.View style={[styles.pulseRing, ringStyle]} pointerEvents="none">
        <Svg width={size} height={size}>
          <Circle cx={size / 2} cy={size / 2} r={size / 2 - 2} fill="rgba(255, 220, 150, 0.2)" />
        </Svg>
      </Animated.View>
      <View style={styles.core}>
        <Svg width={32} height={32}>
          <Defs>
            <RadialGradient id="nextWp" cx="50%" cy="50%" r="50%">
              <Stop offset="0%" stopColor="#FFFFFF" stopOpacity={1} />
              <Stop offset="100%" stopColor="#E8C872" stopOpacity={0.9} />
            </RadialGradient>
          </Defs>
          <Circle cx={16} cy={16} r={14} fill="url(#nextWp)" />
          <Circle cx={16} cy={16} r={14} fill="transparent" stroke="#E8C872" strokeWidth={1} />
        </Svg>
        <Text style={styles.spark}>✦</Text>
      </View>
    </Pressable>
  );
}

export const NextStepWaypoint = memo(NextStepWaypointComponent);

const styles = StyleSheet.create({
  hit: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulseRing: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  core: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  spark: {
    position: 'absolute',
    fontSize: 12,
    color: '#1A1538',
    fontWeight: '700',
  },
});
