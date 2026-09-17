import { StyleSheet, View } from 'react-native';
import Svg, { Defs, Path, RadialGradient, Stop } from 'react-native-svg';

import { CelestialSkyAtmosphere } from '@/constants/celestialTokens';

interface SkyGlowProps {
  width: number;
  height: number;
  /** Nebula violet wash at top + horizon warmth at bottom. */
  variant?: 'nebula' | 'arrivalVeil';
}

/** Deep navy / indigo / violet atmosphere overlays — reuse across sky screens. */
export function SkyGlow({ width, height, variant = 'nebula' }: SkyGlowProps) {
  if (variant === 'arrivalVeil') {
    return (
      <Svg width={width} height={height}>
        <Defs>
          <RadialGradient id="reelyouSkyArrival" cx="50%" cy="30%" rx="55%" ry="45%">
            <Stop offset="0%" stopColor={CelestialSkyAtmosphere.arrivalVeil} stopOpacity={0.85} />
            <Stop offset="100%" stopColor={CelestialSkyAtmosphere.base} stopOpacity={0.95} />
          </RadialGradient>
        </Defs>
        <Path d={`M 0 0 H ${width} V ${height} H 0 Z`} fill="url(#reelyouSkyArrival)" />
      </Svg>
    );
  }

  return (
    <Svg width={width} height={height}>
      <Defs>
        <RadialGradient id="reelyouNebulaTop" cx="50%" cy="12%" rx="60%" ry="40%">
          <Stop offset="0%" stopColor={CelestialSkyAtmosphere.nebulaTop} stopOpacity={0.45} />
          <Stop offset="55%" stopColor={CelestialSkyAtmosphere.nebulaMid} stopOpacity={0.18} />
          <Stop offset="100%" stopColor={CelestialSkyAtmosphere.base} stopOpacity={0} />
        </RadialGradient>
        <RadialGradient id="reelyouHorizonGlow" cx="50%" cy="100%" rx="70%" ry="35%">
          <Stop offset="0%" stopColor={CelestialSkyAtmosphere.horizonGlow} stopOpacity={0.12} />
          <Stop offset="100%" stopColor={CelestialSkyAtmosphere.base} stopOpacity={0} />
        </RadialGradient>
      </Defs>
      <Path d={`M 0 0 H ${width} V ${height * 0.55} H 0 Z`} fill="url(#reelyouNebulaTop)" />
      <Path d={`M 0 ${height * 0.65} H ${width} V ${height} H 0 Z`} fill="url(#reelyouHorizonGlow)" />
    </Svg>
  );
}

/** Full-screen sky tint overlay matching approved atmosphere. */
export function SkyAtmosphereTint() {
  return <View style={styles.tint} accessibilityElementsHidden />;
}

const styles = StyleSheet.create({
  tint: {
    ...StyleSheet.absoluteFill,
    backgroundColor: CelestialSkyAtmosphere.tint,
  },
});
