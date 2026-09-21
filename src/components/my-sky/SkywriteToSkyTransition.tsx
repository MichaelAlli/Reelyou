import { useEffect, useMemo } from 'react';
import { useOnboarding } from '@/onboarding';
import { MySkyStarInteractionOverlay } from '@/components/my-sky/MySkyStarInteractionOverlay';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import Svg from 'react-native-svg';

import {
  CelestialSkyAtmosphere,
  CelestialStarBloom,
  CompactFourPointStar,
  ShootingStarTrail,
  SkyAtmosphereTint,
  SkyGlow,
  sampleQuadraticPath,
} from '@/components/celestial';
import {
  CelestialArrivalMotion,
  CelestialShootingStarFlightMotion,
  CelestialStarBreathMotion,
} from '@/constants/celestialMotion';
import { MySkyBackdrop } from '@/components/my-sky/MySkyBackdrop';
import { MySkyConstellationLayer } from '@/components/my-sky/MySkyConstellationLayer';
import { ReelyouEasing } from '@/constants/animation';
import { MY_SKY_SHOOTING_STAR_PATH } from '@/mySky/constellationLayout';

interface SkywriteToSkyTransitionProps {
  onComplete: () => void;
}

function CompactStarSvg({ size, color }: { size: number; color: string }) {
  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <CompactFourPointStar size={size} color={color} />
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
  const { mySkyView, skywrites, communities, guidingLightView } = useOnboarding();
  const joinedCommunityIds = useMemo(
    () => communities.joined.map((entry) => entry.id),
    [communities.joined],
  );
  const guidanceActive = Boolean(guidingLightView.light?.title?.trim());

  const progress = useSharedValue(0);
  const emerge = useSharedValue(0);
  const bloom = useSharedValue(0);
  const destGlow = useSharedValue(0);
  const sceneFade = useSharedValue(0);
  const raySpin = useSharedValue(0);
  const trailOpacity = useSharedValue(0);
  const linksOpacity = useSharedValue(0);
  const starBreath = useSharedValue(0);

  const { startX, startY, controlX, controlY, endX, endY } = useMemo(() => {
    const s = MY_SKY_SHOOTING_STAR_PATH;
    return {
      startX: width * s.start.x,
      startY: height * s.start.y,
      controlX: width * s.control.x,
      controlY: height * s.control.y,
      endX: width * s.end.x,
      endY: height * s.end.y,
    };
  }, [width, height]);

  useEffect(() => {
    const { flightDelayMs, flightDurationMs, destGlowDelayMs, sceneFadeDelayMs, totalDurationMs } =
      CelestialShootingStarFlightMotion;

    emerge.value = withSequence(
      withTiming(1, { duration: 280, easing: ReelyouEasing.out }),
      withTiming(0.35, { duration: 320 }),
    );
    bloom.value = withSequence(
      withTiming(1, { duration: 400, easing: ReelyouEasing.out }),
      withTiming(0.7, { duration: 500 }),
    );
    progress.value = withDelay(
      flightDelayMs,
      withTiming(1, { duration: flightDurationMs, easing: Easing.bezier(0.18, 0.58, 0.32, 1) }),
    );
    destGlow.value = withDelay(
      destGlowDelayMs,
      withSequence(
        withTiming(1, { duration: 500, easing: ReelyouEasing.out }),
        withTiming(0.85, { duration: 300 }),
      ),
    );
    sceneFade.value = withDelay(sceneFadeDelayMs, withTiming(1, { duration: 550, easing: ReelyouEasing.out }));
    raySpin.value = withDelay(180, withTiming(1, { duration: flightDurationMs + 400, easing: Easing.linear }));

    const timer = setTimeout(onComplete, totalDurationMs);
    return () => clearTimeout(timer);
  }, [bloom, destGlow, emerge, onComplete, progress, raySpin, sceneFade]);

  const emergenceStyle = useAnimatedStyle(() => ({
    opacity: interpolate(emerge.value, [0, 0.5, 1], [0, 0.55, 0]),
    transform: [{ scale: interpolate(emerge.value, [0, 1], [0.6, 1.8]) }],
  }));

  const starStyle = useAnimatedStyle(() => {
    const t = progress.value;
    const point = sampleQuadraticPath(t, MY_SKY_SHOOTING_STAR_PATH, width, height);
    const scale =
      interpolate(bloom.value, [0, 1], [0.35, 1]) * interpolate(t, [0, 0.88, 1], [1, 1, 0.88]);
    const spin = interpolate(raySpin.value, [0, 1], [0, 45]);
    return {
      transform: [
        { translateX: point.x - 14 },
        { translateY: point.y - 14 },
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

  const flying = CelestialStarBloom.flying;
  const destination = CelestialStarBloom.destination;
  const landingPulse = CelestialStarBloom.landingPulse;

  return (
    <View style={styles.root}>
      <MySkyBackdrop />
      <SkyAtmosphereTint />

      <View style={styles.nebulaLayer} accessibilityElementsHidden pointerEvents="none">
        <SkyGlow width={width} height={height} variant="nebula" />
      </View>

      <View style={styles.starFieldLayer} pointerEvents="none">
        <MySkyConstellationLayer
          width={width}
          height={height}
          trailOpacity={trailOpacity}
          linksOpacity={linksOpacity}
          starBreath={starBreath}
        />
      </View>

      <Animated.View
        style={[styles.emergenceFlash, emergenceStyle, { left: startX - 60, top: startY - 60 }]}
        accessibilityElementsHidden
        pointerEvents="none">
        <View style={styles.emergenceCore} />
      </Animated.View>

      <Animated.View
        style={[styles.trailLayer, purpleTrailStyle]}
        accessibilityElementsHidden
        pointerEvents="none">
        <Svg width={width} height={height}>
          <ShootingStarTrail width={width} height={height} variant="flight" layer="underglow" />
        </Svg>
      </Animated.View>

      <Animated.View style={[styles.trailLayer, trailStyle]} accessibilityElementsHidden pointerEvents="none">
        <Svg width={width} height={height}>
          <ShootingStarTrail width={width} height={height} variant="flight" layer="core" gradientId="shootTrail" />
        </Svg>
      </Animated.View>

      {particles.map((style, index) => (
        <Animated.View key={index} style={[styles.particle, style]} pointerEvents="none">
          <View
            style={[
              styles.particleDot,
              index % 3 === 1 && styles.particleSm,
              index % 3 === 2 && styles.particlePurple,
            ]}
          />
        </Animated.View>
      ))}

      <Animated.View style={[styles.destPulse, destPulseStyle]} accessibilityElementsHidden pointerEvents="none">
        <View style={[styles.destPulseRing, { borderColor: landingPulse.border, backgroundColor: landingPulse.fill }]} />
      </Animated.View>

      <Animated.View
        style={[styles.destStar, destStarStyle]}
        accessibilityLabel="New star in your sky"
        pointerEvents="none">
        <View style={[styles.destHalo, { backgroundColor: destination.halo, borderColor: destination.haloBorder }]} />
        <CompactStarSvg size={destination.size} color={destination.color} />
      </Animated.View>

      <Animated.View style={[styles.flyingStar, starStyle]} accessibilityLabel="Shooting star" pointerEvents="none">
        <Animated.View style={[styles.starBloom, starGlowStyle, { backgroundColor: flying.bloom }]} />
        <View style={[styles.starHalo, { backgroundColor: flying.halo, borderColor: flying.haloBorder }]} />
        <CompactStarSvg size={flying.size} color={flying.color} />
      </Animated.View>

      <Animated.View
        style={[styles.skyHandoff, skyHandoffStyle]}
        accessibilityElementsHidden
        pointerEvents="none">
        <SkyGlow width={width} height={height} variant="arrivalVeil" />
      </Animated.View>

      <MySkyStarInteractionOverlay
        view={mySkyView}
        skywrites={skywrites}
        joinedCommunityIds={joinedCommunityIds}
        guidanceActive={guidanceActive}
        layoutWidth={width}
        layoutHeight={height}
        allowTapDuringGesture
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: CelestialSkyAtmosphere.base,
  },
  starFieldLayer: {
    ...StyleSheet.absoluteFill,
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
    pointerEvents: 'none',
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
  },
  starHalo: {
    position: 'absolute',
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
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
    borderWidth: 1.5,
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
