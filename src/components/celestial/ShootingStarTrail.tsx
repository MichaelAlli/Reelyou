import { Circle, Defs, LinearGradient, Path, Stop } from 'react-native-svg';

import { CelestialPalette, CelestialShootingStarTrail } from '@/constants/celestialTokens';
import { buildShootingStarPathD, sampleQuadraticPath } from '@/components/celestial/celestialGeometry';
import { MY_SKY_SHOOTING_STAR_PATH } from '@/mySky/constellationLayout';

export type ShootingStarTrailVariant = 'settled' | 'flight';
export type ShootingStarTrailLayer = 'full' | 'underglow' | 'core';

interface ShootingStarTrailProps {
  width: number;
  height: number;
  variant?: ShootingStarTrailVariant;
  gradientId?: string;
  /** Split render for animated flight layers — underglow is lavender only. */
  layer?: ShootingStarTrailLayer;
}

/** Approved golden shooting-star trail — glow, gradient core, spark particles. */
export function ShootingStarTrail({
  width,
  height,
  variant = 'settled',
  gradientId = 'reelyouShootTrail',
  layer = 'full',
}: ShootingStarTrailProps) {
  const pathD = buildShootingStarPathD(width, height);
  const stops = CelestialShootingStarTrail.gradientStops[variant];
  const sparkCount =
    variant === 'settled'
      ? CelestialShootingStarTrail.sparkCount.settled
      : CelestialShootingStarTrail.sparkCount.flight;

  if (layer === 'underglow') {
    return (
      <Path
        d={pathD}
        fill="none"
        stroke={CelestialPalette.lavenderTrail}
        strokeWidth={CelestialShootingStarTrail.glowStrokeWidth}
        strokeLinecap="round"
      />
    );
  }

  return (
    <>
      {layer === 'full' && variant === 'settled' ? (
        <Path
          d={pathD}
          fill="none"
          stroke={CelestialShootingStarTrail.glowStroke}
          strokeWidth={CelestialShootingStarTrail.glowStrokeWidth}
          strokeLinecap="round"
        />
      ) : null}
      <Defs>
        <LinearGradient id={gradientId} x1="0" y1="1" x2="1" y2="0">
          {stops.map((stop) => (
            <Stop key={stop.offset} offset={stop.offset} stopColor={stop.color} stopOpacity={stop.opacity} />
          ))}
        </LinearGradient>
      </Defs>
      {variant === 'flight' ? (
        <Path
          d={pathD}
          fill="none"
          stroke={CelestialShootingStarTrail.flightMidGlow}
          strokeWidth={CelestialShootingStarTrail.flightMidGlowWidth}
          strokeLinecap="round"
        />
      ) : null}
      <Path
        d={pathD}
        fill="none"
        stroke={`url(#${gradientId})`}
        strokeWidth={CelestialShootingStarTrail.coreStrokeWidth}
        strokeLinecap="round"
      />
      {layer === 'full' && variant === 'settled'
        ? Array.from({ length: sparkCount }).map((_, i) => {
            const t = i / (sparkCount - 1);
            const { x: px, y: py } = sampleQuadraticPath(t, MY_SKY_SHOOTING_STAR_PATH, width, height);
            return (
              <Circle
                key={`spark-${i}`}
                cx={px}
                cy={py}
                r={i % 3 === 0 ? 2.2 : 1.2}
                fill={CelestialShootingStarTrail.sparkColors[i % 2]}
                opacity={0.55 + t * 0.35}
              />
            );
          })
        : null}
    </>
  );
}
