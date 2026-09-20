import { memo, useEffect } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, Defs, Ellipse, Line, Path, RadialGradient, Stop } from 'react-native-svg';

/** Feet sit 7px above the figure SVG box bottom (viewBox y=90 / height 96). */
const FIGURE_W = 84;
const FIGURE_H = 112;
const FEET_INSET_FROM_BOX_BOTTOM = 7;
const PLATFORM_H = 34;
const STACK_W = 136;
/** Feet land on platform surface — stack bottom = trail anchor (REF_TRAVELER). */
const PLATFORM_SURFACE_FROM_BOTTOM = 24;
const FIGURE_BOTTOM_OFFSET = PLATFORM_SURFACE_FROM_BOTTOM - FEET_INSET_FROM_BOX_BOTTOM;
const STACK_H = FIGURE_BOTTOM_OFFSET + FIGURE_H;

interface JourneyTravelerProps {
  x: number;
  y: number;
  onPress?: () => void;
}

function JourneyTravelerComponent({ x, y, onPress }: JourneyTravelerProps) {
  const glow = useSharedValue(0);

  useEffect(() => {
    glow.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 3600, easing: Easing.inOut(Easing.quad) }),
        withTiming(0, { duration: 3600, easing: Easing.inOut(Easing.quad) }),
      ),
      -1,
      false,
    );
  }, [glow]);

  const baseStyle = useAnimatedStyle(() => ({
    opacity: 0.78 + glow.value * 0.22,
    transform: [{ scale: 0.995 + glow.value * 0.02 }],
  }));

  const beamStyle = useAnimatedStyle(() => ({
    opacity: 0.3 + glow.value * 0.26,
  }));

  const cx = STACK_W / 2;
  const platformCy = PLATFORM_SURFACE_FROM_BOTTOM - 2;

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.root,
        {
          left: x,
          top: y - STACK_H,
          width: STACK_W,
          height: STACK_H,
          transform: [{ translateX: -STACK_W / 2 }],
        },
      ]}
      testID="journey-traveler"
      accessibilityRole="button"
      accessibilityLabel="Your avatar on the Starpath"
      accessibilityHint="Choose or update how you appear on your journey"
    >
      <Animated.View style={[styles.trailBeam, beamStyle]} pointerEvents="none">
        <Svg width={STACK_W} height={STACK_H}>
          <Defs>
            <RadialGradient id="avatarBeam" cx="50%" cy="100%" r="75%">
              <Stop offset="0%" stopColor="rgba(255, 235, 185, 0.55)" />
              <Stop offset="100%" stopColor="rgba(255, 220, 150, 0)" />
            </RadialGradient>
          </Defs>
          <Ellipse
            cx={cx}
            cy={PLATFORM_SURFACE_FROM_BOTTOM}
            rx={18}
            ry={STACK_H * 0.38}
            fill="url(#avatarBeam)"
          />
        </Svg>
      </Animated.View>

      <Animated.View
        style={[styles.platform, { bottom: 0, height: PLATFORM_H }, baseStyle]}
        pointerEvents="none"
      >
        <Svg width={STACK_W} height={PLATFORM_H}>
          <Defs>
            <RadialGradient id="waypointCore" cx="50%" cy="55%" r="58%">
              <Stop offset="0%" stopColor="rgba(255, 245, 210, 0.65)" />
              <Stop offset="100%" stopColor="rgba(255, 200, 100, 0)" />
            </RadialGradient>
          </Defs>
          <Ellipse cx={cx} cy={platformCy} rx={42} ry={6.5} fill="url(#waypointCore)" />
          <Ellipse
            cx={cx}
            cy={platformCy + 1}
            rx={32}
            ry={4.5}
            fill="transparent"
            stroke="rgba(255, 225, 160, 0.82)"
            strokeWidth={1}
          />
          <Ellipse
            cx={cx}
            cy={platformCy + 1}
            rx={20}
            ry={3}
            fill="transparent"
            stroke="rgba(255, 235, 190, 0.58)"
            strokeWidth={0.75}
          />
          <Circle cx={cx} cy={platformCy + 1} r={4.5} fill="rgba(255, 240, 210, 0.62)" />
          {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => {
            const rad = (deg * Math.PI) / 180;
            return (
              <Line
                key={`geo-${deg}`}
                x1={cx + Math.cos(rad) * 7}
                y1={platformCy + 1 + Math.sin(rad) * 1.5}
                x2={cx + Math.cos(rad) * 24}
                y2={platformCy + 1 + Math.sin(rad) * 3.5}
                stroke="rgba(255, 225, 160, 0.36)"
                strokeWidth={0.7}
              />
            );
          })}
        </Svg>
      </Animated.View>

      <View style={[styles.figure, { bottom: FIGURE_BOTTOM_OFFSET }]}>
        <Svg width={FIGURE_W} height={FIGURE_H} viewBox="0 0 72 96">
          <Defs>
            <RadialGradient id="figureRim" cx="50%" cy="22%" r="65%">
              <Stop offset="0%" stopColor="rgba(255, 220, 160, 0.5)" />
              <Stop offset="55%" stopColor="rgba(40, 36, 52, 0.96)" />
              <Stop offset="100%" stopColor="rgba(12, 14, 28, 0.98)" />
            </RadialGradient>
          </Defs>
          <Path
            d="M 36 6 C 43 6 48 13 48 20 C 48 27 45 31 41 33 L 45 39 C 49 46 51 54 49 62 L 47 80 C 46 86 43 90 36 90 C 29 90 26 86 25 80 L 23 62 C 21 54 23 46 27 39 L 31 33 C 27 31 24 27 24 20 C 24 13 29 6 36 6 Z"
            fill="url(#figureRim)"
            stroke="rgba(255, 220, 160, 0.22)"
            strokeWidth={0.6}
          />
        </Svg>
      </View>

      <View style={styles.riseParticles} pointerEvents="none">
        <Svg width={STACK_W} height={40}>
          {[0, 1, 2, 3].map((i) => (
            <Circle
              key={`rise-${i}`}
              cx={cx + (i - 1.5) * 4}
              cy={8 - i * 3}
              r={0.8}
              fill="rgba(255, 245, 220, 0.65)"
              opacity={0.35 + i * 0.08}
            />
          ))}
        </Svg>
      </View>
    </Pressable>
  );
}

export const JourneyTraveler = memo(JourneyTravelerComponent);
export const PotentialAnchor = JourneyTraveler;

const styles = StyleSheet.create({
  root: {
    position: 'absolute',
    alignItems: 'center',
  },
  trailBeam: {
    ...StyleSheet.absoluteFill,
  },
  platform: {
    position: 'absolute',
    width: STACK_W,
    left: 0,
    zIndex: 1,
  },
  figure: {
    position: 'absolute',
    width: FIGURE_W,
    left: (STACK_W - FIGURE_W) / 2,
    zIndex: 2,
  },
  riseParticles: {
    position: 'absolute',
    bottom: PLATFORM_SURFACE_FROM_BOTTOM + 2,
    left: 0,
    width: STACK_W,
    height: 40,
    zIndex: 3,
    alignItems: 'center',
  },
});
