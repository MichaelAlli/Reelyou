import { memo, useMemo } from 'react';
import Svg, {
  Circle,
  Defs,
  G,
  LinearGradient,
  Path,
  RadialGradient,
  Stop,
} from 'react-native-svg';
import Animated, { useAnimatedProps, type SharedValue } from 'react-native-reanimated';

import { buildReelyouSignatureCelestial } from '@/components/process-starpath/processStarPathGeometry';
import { ProcessPalette } from '@/components/process-starpath/processStarPathSpec';

const AnimatedG = Animated.createAnimatedComponent(G);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const P = ProcessPalette;

interface ProcessHeroStarProps {
  size: number;
  breath: SharedValue<number>;
  reveal: SharedValue<number>;
  energyPulse: SharedValue<number>;
}

function ProcessHeroStarComponent({ size, breath, reveal, energyPulse }: ProcessHeroStarProps) {
  const celestial = useMemo(() => buildReelyouSignatureCelestial(size), [size]);
  const haloR = size * 0.58;

  const groupProps = useAnimatedProps(() => {
    const scale = breath.value + energyPulse.value * 0.01;
    return {
      opacity: reveal.value * (0.96 + energyPulse.value * 0.04),
      transform: [{ scale }],
    };
  });

  const haloProps = useAnimatedProps(() => ({
    opacity: 0.07 + (breath.value - 1) * 1.1 + energyPulse.value * 0.11,
    r: haloR * (0.98 + (breath.value - 1) * 0.45),
  }));

  const coreProps = useAnimatedProps(() => ({
    opacity: 0.92 + (breath.value - 1) * 0.8 + energyPulse.value * 0.08,
    r: celestial.coreR * (0.98 + (breath.value - 1) * 0.3),
  }));

  const sheenProps = useAnimatedProps(() => ({
    cx: -size * 0.04 + (breath.value - 1) * size * 2.2,
    cy: -size * 0.06 + (breath.value - 1) * size * 0.8,
    opacity: 0.32 + (breath.value - 1) * 1.4 + energyPulse.value * 0.2,
    r: size * 0.045,
  }));

  return (
    <AnimatedG animatedProps={groupProps}>
      <Defs>
        <RadialGradient id="sigHalo" cx="50%" cy="48%" r="50%">
          <Stop offset="0%" stopColor="#FFF4D6" stopOpacity="0.5" />
          <Stop offset="55%" stopColor={P.gold} stopOpacity="0.14" />
          <Stop offset="100%" stopColor={P.goldDeep} stopOpacity="0" />
        </RadialGradient>
        <LinearGradient id="sigRay" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0%" stopColor="#FFF9EC" stopOpacity="0.95" />
          <Stop offset="45%" stopColor={P.goldBright} stopOpacity="0.92" />
          <Stop offset="100%" stopColor="#9A7209" stopOpacity="0.78" />
        </LinearGradient>
        <RadialGradient id="sigCore" cx="38%" cy="32%" r="68%">
          <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="1" />
          <Stop offset="45%" stopColor="#FFF4CC" stopOpacity="0.98" />
          <Stop offset="100%" stopColor={P.gold} stopOpacity="0.95" />
        </RadialGradient>
      </Defs>

      <AnimatedCircle cx={0} cy={0} fill="url(#sigHalo)" animatedProps={haloProps} />

      {celestial.rays.map((ray, i) => (
        <Path
          key={`ray-${i}`}
          d={ray.d}
          fill="url(#sigRay)"
          opacity={0.55 + ray.weight * 0.38}
          stroke="rgba(255, 248, 220, 0.22)"
          strokeWidth={0.25}
        />
      ))}

      {celestial.facets.map((d, i) => (
        <Path
          key={`facet-${i}`}
          d={d}
          fill="url(#sigRay)"
          opacity={0.72}
          stroke="rgba(255, 248, 220, 0.16)"
          strokeWidth={0.2}
        />
      ))}

      <AnimatedCircle cx={0} cy={0} fill="url(#sigCore)" animatedProps={coreProps} />
      <AnimatedCircle fill="#FFFEF8" animatedProps={sheenProps} />
    </AnimatedG>
  );
}

export const ProcessHeroStar = memo(ProcessHeroStarComponent);
