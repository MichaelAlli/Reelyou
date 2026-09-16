import { useEffect, useMemo } from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import Svg, { Defs, LinearGradient, Path, RadialGradient, Stop } from 'react-native-svg';

import { MySkyBackdrop } from '@/components/my-sky/MySkyBackdrop';
import { ReelyouEasing } from '@/constants/animation';
import { MY_SKY_SHOOTING_STAR_PATH } from '@/mySky/constellationLayout';

interface SkywriteToSkyTransitionProps {
  onComplete: () => void;
}

const DURATION_MS = 3000;
const FLIGHT_MS = 2400;

function FourPointStar({ size, color }: { size: number; color: string }) {
  const half = size / 2;
  const inner = size * 0.22;
  const d = `M ${half} 0 L ${half + inner} ${half - inner} L ${size} ${half} L ${half + inner} ${half + inner} L ${half} ${size} L ${half - inner} ${half + inner} L 0 ${half} L ${half - inner} ${half - inner} Z`;
  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <Path d={d} fill={color} />
    </Svg>
  );
}

function useParticleStyle(
  progress: SharedValue<number>,
  offset: number,
  startX: number,
  startY: number,
  controlX: number,
  controlY: number,
  endX: number,
  endY: number,
) {
  return useAnimatedStyle(() => {
    const t = Math.max(0, progress.value - offset * 0.035);
    const inv = 1 - t;
    const x = inv * inv * startX + 2 * inv * t * controlX + t * t * endX + (offset - 4) * 5;
    const y = inv * inv * startY + 2 * inv * t * controlY + t * t * endY + offset * 2.5;
    return {
      transform: [{ translateX: x }, { translateY: y }],
      opacity: interpolate(t, [0, 0.15, 0.75, 1], [0, 0.85, 0.4, 0]),
    };
  });
}

/** Cinematic shooting-star rise — ~3s, Reanimated + SVG, premium celestial handoff. */
export function SkywriteToSkyTransition({ onComplete }: SkywriteToSkyTransitionProps) {
  const { width, height } = useWindowDimensions();
  const progress = useSharedValue(0);
  const emerge = useSharedValue(0);
  const bloom = useSharedValue(0);
  const destGlow = useSharedValue(0);
  const sceneFade = useSharedValue(0);
  const raySpin = useSharedValue(0);

  const { startX, startY, controlX, controlY, endX, endY, trailPath } = useMemo(() => {
    const s = MY_SKY_SHOOTING_STAR_PATH;
    return {
      startX: width * s.start.x,
      startY: height * s.start.y,
      controlX: width * s.control.x,
      controlY: height * s.control.y,
      endX: width * s.end.x,
      endY: height * s.end.y,
      trailPath: `M ${width * s.start.x} ${height * s.start.y} Q ${width * s.control.x} ${height * s.control.y} ${width * s.end.x} ${height * s.end.y}`,
    };
  }, [width, height]);

  useEffect(() => {
    emerge.value = withSequence(
      withTiming(1, { duration: 280, easing: ReelyouEasing.out }),
      withTiming(0.35, { duration: 320 }),
    );
    bloom.value = withSequence(
      withTiming(1, { duration: 400, easing: ReelyouEasing.out }),
      withTiming(0.7, { duration: 500 }),
    );
    progress.value = withDelay(
      220,
      withTiming(1, { duration: FLIGHT_MS, easing: Easing.bezier(0.18, 0.58, 0.32, 1) }),
    );
    destGlow.value = withDelay(
      2200,
      withSequence(
        withTiming(1, { duration: 500, easing: ReelyouEasing.out }),
        withTiming(0.85, { duration: 300 }),
      ),
    );
    sceneFade.value = withDelay(2400, withTiming(1, { duration: 550, easing: ReelyouEasing.out }));
    raySpin.value = withDelay(180, withTiming(1, { duration: FLIGHT_MS + 400, easing: Easing.linear }));

    const timer = setTimeout(onComplete, DURATION_MS);
    return () => clearTimeout(timer);
  }, [bloom, destGlow, emerge, onComplete, progress, raySpin, sceneFade]);

  const emergenceStyle = useAnimatedStyle(() => ({
    opacity: interpolate(emerge.value, [0, 0.5, 1], [0, 0.55, 0]),
    transform: [{ scale: interpolate(emerge.value, [0, 1], [0.6, 1.8]) }],
  }));

  const starStyle = useAnimatedStyle(() => {
    const t = progress.value;
    const inv = 1 - t;
    const x = inv * inv * startX + 2 * inv * t * controlX + t * t * endX;
    const y = inv * inv * startY + 2 * inv * t * controlY + t * t * endY;
    const scale =
      interpolate(bloom.value, [0, 1], [0.35, 1]) * interpolate(t, [0, 0.88, 1], [1, 1, 0.88]);
    const spin = interpolate(raySpin.value, [0, 1], [0, 45]);
    return {
      transform: [
        { translateX: x - 14 },
        { translateY: y - 14 },
        { scale },
        { rotate: `${spin}deg` },
      ],
      opacity: interpolate(t, [0, 0.06, 0.9, 1], [0, 1, 1, 0.9]),
    };
  });

  const starGlowStyle = useAnimatedStyle(() => ({
    opacity: interpolate(bloom.value, [0, 1], [0, 0.65]) * interpolate(progress.value, [0, 0.5, 1], [0.4, 1, 0.7]),
    transform: [{ scale: 1 + bloom.value * 0.5 }],
  }));

  const trailStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 0.1, 0.8, 1], [0, 0.95, 0.5, 0.15]),
  }));

  const purpleTrailStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 0.15, 0.75, 1], [0, 0.35, 0.2, 0]),
  }));

  const destStarStyle = useAnimatedStyle(() => ({
    opacity: destGlow.value,
    transform: [
      { translateX: endX - 18 },
      { translateY: endY - 18 },
      { scale: interpolate(destGlow.value, [0, 0.6, 1], [0.5, 1.25, 1.1]) },
    ],
  }));

  const destPulseStyle = useAnimatedStyle(() => ({
    opacity: interpolate(destGlow.value, [0, 0.5, 1], [0, 0.5, 0.25]),
    transform: [
      { translateX: endX - 28 },
      { translateY: endY - 28 },
      { scale: interpolate(destGlow.value, [0, 1], [0.8, 1.6]) },
    ],
  }));

  const skyHandoffStyle = useAnimatedStyle(() => ({
    opacity: interpolate(sceneFade.value, [0, 1], [0, 0.92]),
  }));

  const p0 = useParticleStyle(progress, 0, startX, startY, controlX, controlY, endX, endY);
  const p1 = useParticleStyle(progress, 1, startX, startY, controlX, controlY, endX, endY);
  const p2 = useParticleStyle(progress, 2, startX, startY, controlX, controlY, endX, endY);
  const p3 = useParticleStyle(progress, 3, startX, startY, controlX, controlY, endX, endY);
  const p4 = useParticleStyle(progress, 4, startX, startY, controlX, controlY, endX, endY);
  const p5 = useParticleStyle(progress, 5, startX, startY, controlX, controlY, endX, endY);
  const p6 = useParticleStyle(progress, 6, startX, startY, controlX, controlY, endX, endY);
  const p7 = useParticleStyle(progress, 7, startX, startY, controlX, controlY, endX, endY);
  const particles = [p0, p1, p2, p3, p4, p5, p6, p7];

  return (
    <View style={styles.root}>
      <MySkyBackdrop />
      <View style={styles.skyTint} accessibilityElementsHidden />

      <Svg width={width} height={height} style={styles.nebulaLayer} accessibilityElementsHidden>
        <Defs>
          <RadialGradient id="nebulaTop" cx="50%" cy="12%" rx="60%" ry="40%">
            <Stop offset="0%" stopColor="#7B4FD4" stopOpacity={0.45} />
            <Stop offset="55%" stopColor="#3D2A6B" stopOpacity={0.18} />
            <Stop offset="100%" stopColor="#05070A" stopOpacity={0} />
          </RadialGradient>
          <RadialGradient id="horizonGlow" cx="50%" cy="100%" rx="70%" ry="35%">
            <Stop offset="0%" stopColor="#FFB347" stopOpacity={0.12} />
            <Stop offset="100%" stopColor="#05070A" stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Path d={`M 0 0 H ${width} V ${height * 0.55} H 0 Z`} fill="url(#nebulaTop)" />
        <Path d={`M 0 ${height * 0.65} H ${width} V ${height} H 0 Z`} fill="url(#horizonGlow)" />
      </Svg>

      <Animated.View
        style={[styles.emergenceFlash, emergenceStyle, { left: startX - 60, top: startY - 60 }]}
        accessibilityElementsHidden>
        <View style={styles.emergenceCore} />
      </Animated.View>

      <Animated.View style={[styles.trailLayer, purpleTrailStyle]} accessibilityElementsHidden>
        <Svg width={width} height={height}>
          <Path
            d={trailPath}
            fill="none"
            stroke="rgba(196, 168, 255, 0.35)"
            strokeWidth={14}
            strokeLinecap="round"
          />
        </Svg>
      </Animated.View>

      <Animated.View style={[styles.trailLayer, trailStyle]} accessibilityElementsHidden>
        <Svg width={width} height={height}>
          <Defs>
            <LinearGradient id="shootTrail" x1="0" y1="1" x2="1" y2="0">
              <Stop offset="0%" stopColor="#FF9F43" stopOpacity={0.08} />
              <Stop offset="35%" stopColor="#FFD57A" stopOpacity={0.85} />
              <Stop offset="75%" stopColor="#FFF8E7" stopOpacity={0.95} />
              <Stop offset="100%" stopColor="#FFFFFF" stopOpacity={0.7} />
            </LinearGradient>
          </Defs>
          <Path d={trailPath} fill="none" stroke="url(#shootTrail)" strokeWidth={3.5} strokeLinecap="round" />
          <Path
            d={trailPath}
            fill="none"
            stroke="rgba(255, 230, 160, 0.32)"
            strokeWidth={9}
            strokeLinecap="round"
          />
        </Svg>
      </Animated.View>

      {particles.map((style, index) => (
        <Animated.View key={index} style={[styles.particle, style]}>
          <View
            style={[
              styles.particleDot,
              index % 3 === 1 && styles.particleSm,
              index % 3 === 2 && styles.particlePurple,
            ]}
          />
        </Animated.View>
      ))}

      <Animated.View style={[styles.destPulse, destPulseStyle]} accessibilityElementsHidden>
        <View style={styles.destPulseRing} />
      </Animated.View>

      <Animated.View style={[styles.destStar, destStarStyle]} accessibilityLabel="New star in your sky">
        <View style={styles.destHalo} />
        <FourPointStar size={20} color="#FFD57A" />
      </Animated.View>

      <Animated.View style={[styles.flyingStar, starStyle]} accessibilityLabel="Shooting star">
        <Animated.View style={[styles.starBloom, starGlowStyle]} />
        <View style={styles.starHalo} />
        <FourPointStar size={28} color="#FFF4D6" />
      </Animated.View>

      <Animated.View style={[styles.skyHandoff, skyHandoffStyle]} accessibilityElementsHidden>
        <Svg width={width} height={height}>
          <Defs>
            <RadialGradient id="skyArrival" cx="50%" cy="30%" rx="55%" ry="45%">
              <Stop offset="0%" stopColor="#1A1538" stopOpacity={0.85} />
              <Stop offset="100%" stopColor="#05070A" stopOpacity={0.95} />
            </RadialGradient>
          </Defs>
          <Path d={`M 0 0 H ${width} V ${height} H 0 Z`} fill="url(#skyArrival)" />
        </Svg>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#05070A',
  },
  skyTint: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(6, 8, 28, 0.42)',
  },
  nebulaLayer: {
    ...StyleSheet.absoluteFill,
  },
  emergenceFlash: {
    position: 'absolute',
    width: 120,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emergenceCore: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 213, 122, 0.35)',
    borderWidth: 1,
    borderColor: 'rgba(255, 248, 231, 0.55)',
  },
  trailLayer: {
    ...StyleSheet.absoluteFill,
  },
  flyingStar: {
    position: 'absolute',
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  starBloom: {
    position: 'absolute',
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 213, 122, 0.28)',
  },
  starHalo: {
    position: 'absolute',
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 213, 122, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 213, 122, 0.28)',
  },
  destStar: {
    position: 'absolute',
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  destHalo: {
    position: 'absolute',
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 213, 122, 0.2)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 213, 122, 0.45)',
  },
  destPulse: {
    position: 'absolute',
    width: 56,
    height: 56,
  },
  destPulseRing: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: 'rgba(255, 213, 122, 0.35)',
    backgroundColor: 'rgba(255, 213, 122, 0.06)',
  },
  particle: {
    position: 'absolute',
    width: 6,
    height: 6,
  },
  particleDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: 'rgba(255, 220, 150, 0.8)',
  },
  particleSm: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
  },
  particlePurple: {
    backgroundColor: 'rgba(196, 168, 255, 0.65)',
  },
  skyHandoff: {
    ...StyleSheet.absoluteFill,
  },
});
