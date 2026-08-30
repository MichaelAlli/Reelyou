import { memo, useEffect, useMemo } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  Easing,
  useAnimatedProps,
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import Svg, { Circle, Defs, LinearGradient, Path, Stop } from 'react-native-svg';

import {
  energyTrailPathD,
  sampleEnergyTrail,
  walkPolyline,
} from '@/components/process-starpath/processStarPathGeometry';
import { ProcessPalette } from '@/components/process-starpath/processStarPathSpec';
import type { ProcessStarPathPoint } from '@/components/process-starpath/types';
import { PROCESS_INTRO_MS } from '@/process/processSessionConstants';

const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const P = ProcessPalette;

interface ProcessStarPathTrailProps {
  width: number;
  height: number;
  origin: ProcessStarPathPoint | null;
  target: ProcessStarPathPoint | null;
  reduceMotion?: boolean;
  energyPulse: SharedValue<number>;
}

const STATIC_DUST = [0.1, 0.22, 0.35, 0.48, 0.62, 0.76];
const FLOW_DUST = [0.06, 0.24, 0.42, 0.58];

function ProcessStarPathTrailComponent({
  width,
  height,
  origin,
  target,
  reduceMotion = false,
  energyPulse,
}: ProcessStarPathTrailProps) {
  const intro = useSharedValue(reduceMotion ? 1 : 0);
  const flow = useSharedValue(0);
  const pulseT = useSharedValue(0);

  const pathD = useMemo(() => {
    if (!origin || !target || width <= 0 || height <= 0) return '';
    return energyTrailPathD(origin, target);
  }, [height, origin, target, width]);

  const samples = useMemo(() => {
    if (!origin || !target) return null;
    return sampleEnergyTrail(origin, target);
  }, [origin, target]);

  useEffect(() => {
    if (!pathD) return;
    if (reduceMotion) {
      intro.value = 1;
      flow.value = 0;
      pulseT.value = 0;
      return;
    }

    intro.value = withDelay(
      PROCESS_INTRO_MS.footerIn,
      withTiming(1, { duration: 900, easing: Easing.out(Easing.cubic) }),
    );
    flow.value = withDelay(
      PROCESS_INTRO_MS.footerIn + 300,
      withRepeat(withTiming(1, { duration: 4200, easing: Easing.linear }), -1, false),
    );
    pulseT.value = withDelay(
      PROCESS_INTRO_MS.footerIn + 800,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 2800, easing: Easing.inOut(Easing.quad) }),
          withTiming(0, { duration: 200, easing: Easing.out(Easing.quad) }),
        ),
        -1,
        false,
      ),
    );
  }, [flow, intro, pathD, pulseT, reduceMotion]);

  useAnimatedReaction(
    () => pulseT.value,
    (v, prev) => {
      if (v > 0.94 && (prev ?? 0) <= 0.94) {
        energyPulse.value = withSequence(
          withTiming(1, { duration: 180, easing: Easing.out(Easing.quad) }),
          withTiming(0, { duration: 520, easing: Easing.out(Easing.quad) }),
        );
      }
    },
    [energyPulse],
  );

  const wrap = useAnimatedStyle(() => ({ opacity: intro.value }));

  if (!origin || !target || !pathD || !samples) return null;

  return (
    <Animated.View style={[styles.layer, { width, height }, wrap]} pointerEvents="none">
      <Svg width={width} height={height}>
        <Defs>
          <LinearGradient id="trailBloom" x1="0" y1="1" x2="0" y2="0">
            <Stop offset="0%" stopColor="rgba(80, 58, 12, 0.08)" />
            <Stop offset="45%" stopColor="rgba(232, 200, 114, 0.22)" />
            <Stop offset="100%" stopColor="rgba(255, 248, 220, 0.32)" />
          </LinearGradient>
          <LinearGradient id="trailInner" x1="0" y1="1" x2="0" y2="0">
            <Stop offset="0%" stopColor="rgba(100, 74, 16, 0.28)" />
            <Stop offset="55%" stopColor="rgba(232, 200, 114, 0.62)" />
            <Stop offset="100%" stopColor="rgba(255, 248, 220, 0.88)" />
          </LinearGradient>
          <LinearGradient id="trailCore" x1="0" y1="1" x2="0" y2="0">
            <Stop offset="0%" stopColor="rgba(140, 104, 22, 0.55)" />
            <Stop offset="100%" stopColor="rgba(255, 252, 235, 1)" />
          </LinearGradient>
        </Defs>

        <Path d={pathD} fill="none" stroke="url(#trailBloom)" strokeWidth={8} strokeLinecap="round" opacity={0.5} />
        <Path d={pathD} fill="none" stroke="url(#trailInner)" strokeWidth={3.6} strokeLinecap="round" opacity={0.46} />
        <Path d={pathD} fill="none" stroke="url(#trailCore)" strokeWidth={1.9} strokeLinecap="round" opacity={0.96} />
        <Path d={pathD} fill="none" stroke={P.goldBright} strokeWidth={0.85} strokeLinecap="round" opacity={0.86} />

        {!reduceMotion ? <TrailEntryBloom target={target} energyPulse={energyPulse} /> : null}

        {STATIC_DUST.map((t, i) => {
          const p = walkPolyline(samples, t);
          return (
            <Circle
              key={`d${t}`}
              cx={p.x}
              cy={p.y}
              r={i % 2 ? 0.9 : 1.4}
              fill={P.goldSoft}
              opacity={0.16 + (i % 3) * 0.06}
            />
          );
        })}

        {!reduceMotion
          ? FLOW_DUST.map((off, i) => (
              <FlowParticle key={off} points={samples} off={off} phase={i * 0.013} flow={flow} />
            ))
          : null}

        {!reduceMotion ? <EnergyPulse points={samples} pulseT={pulseT} /> : null}
      </Svg>
    </Animated.View>
  );
}

export const ProcessStarPathTrail = memo(ProcessStarPathTrailComponent);

function TrailEntryBloom({
  target,
  energyPulse,
}: {
  target: ProcessStarPathPoint;
  energyPulse: SharedValue<number>;
}) {
  const outer = useAnimatedProps(() => ({
    cx: target.x,
    cy: target.y,
    opacity: 0.08 + energyPulse.value * 0.18,
    r: 10 + energyPulse.value * 6,
  }));
  const core = useAnimatedProps(() => ({
    cx: target.x,
    cy: target.y,
    opacity: 0.12 + energyPulse.value * 0.32,
    r: 3.5 + energyPulse.value * 2.5,
  }));
  return (
    <>
      <AnimatedCircle fill={P.gold} animatedProps={outer} />
      <AnimatedCircle fill="#FFF8DC" animatedProps={core} />
    </>
  );
}

function FlowParticle({
  points,
  off,
  phase,
  flow,
}: {
  points: ProcessStarPathPoint[];
  off: number;
  phase: number;
  flow: SharedValue<number>;
}) {
  const props = useAnimatedProps(() => {
    const t = (off + flow.value + phase) % 1;
    const p = walkPolyline(points, t);
    const fade = t > 0.9 ? (1 - t) / 0.1 : t < 0.04 ? t / 0.04 : 1;
    return {
      cx: p.x,
      cy: p.y,
      opacity: (0.26 + Math.sin(t * Math.PI) * 0.42) * fade,
      r: 1 + t * 1.2,
    };
  });
  return <AnimatedCircle fill={P.goldBright} animatedProps={props} />;
}

function EnergyPulse({
  points,
  pulseT,
}: {
  points: ProcessStarPathPoint[];
  pulseT: SharedValue<number>;
}) {
  const props = useAnimatedProps(() => {
    const t = pulseT.value;
    const p = walkPolyline(points, t);
    const fade = t > 0.88 ? (1 - t) / 0.12 : 0.55 + t * 0.45;
    return {
      cx: p.x,
      cy: p.y,
      opacity: fade * (0.62 + t * 0.28),
      r: 2 + t * 1.6,
    };
  });
  return <AnimatedCircle fill="#FFF8DC" animatedProps={props} />;
}

const styles = StyleSheet.create({
  layer: { position: 'absolute', left: 0, top: 0, zIndex: 4 },
});
