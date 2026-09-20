import { memo, useMemo } from 'react';
import { StyleSheet } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

import type { StarPathLayoutMetrics } from '@/starpath/starpathLayoutMetrics';
import { buildOrganicTrailsForMetrics, type StarPathBranchSpec } from '@/starpath/starpathReferenceLayout';

interface OrganicJourneyTrailsProps {
  metrics: StarPathLayoutMetrics;
  branches: StarPathBranchSpec[];
}

function OrganicJourneyTrailsComponent({ metrics, branches }: OrganicJourneyTrailsProps) {
  const trails = useMemo(
    () => buildOrganicTrailsForMetrics(metrics, branches),
    [metrics, branches],
  );

  return (
    <Svg
      width={metrics.worldWidth}
      height={metrics.worldHeight}
      style={StyleSheet.absoluteFill}
      pointerEvents="none"
    >
      {trails.map((trail) => (
        <Path
          key={`${trail.id}-aura`}
          d={trail.d}
          stroke={trail.glowColor ?? trail.color}
          strokeWidth={(trail.strokeWidth ?? 2.4) + 9}
          strokeOpacity={(trail.opacity ?? 0.4) * 0.085}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ))}
      {trails.map((trail) => (
        <Path
          key={`${trail.id}-bloom`}
          d={trail.d}
          stroke={trail.glowColor ?? trail.color}
          strokeWidth={(trail.strokeWidth ?? 2.4) + 5}
          strokeOpacity={(trail.opacity ?? 0.4) * 0.16}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ))}
      {trails.map((trail) => (
        <Path
          key={`${trail.id}-core`}
          d={trail.d}
          stroke={trail.color}
          strokeWidth={trail.strokeWidth ?? 2.4}
          strokeOpacity={(trail.opacity ?? 0.4) * 0.78}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ))}
      {trails.map((trail) => (
        <Path
          key={trail.id}
          d={trail.d}
          stroke="#FFFFFF"
          strokeWidth={0.9}
          strokeOpacity={(trail.opacity ?? 0.4) * 0.42}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          testID={`journey-branch-${trail.id}`}
        />
      ))}
      {trails.flatMap((trail) =>
        (trail.sparks ?? []).map((s, i) => (
          <Circle
            key={`${trail.id}-spark-${i}`}
            cx={s.x}
            cy={s.y}
            r={1.15}
            fill="#FFFFFF"
            opacity={0.32 + (i % 2) * 0.12}
          />
        )),
      )}
      {trails.flatMap((trail) =>
        (trail.checkpoints ?? []).map((c, i) => (
          <Circle
            key={`${trail.id}-chk-${i}`}
            cx={c.x}
            cy={c.y}
            r={2.4}
            fill={trail.glowColor ?? trail.color}
            opacity={0.35}
          />
        )),
      )}
    </Svg>
  );
}

export const OrganicJourneyTrails = memo(OrganicJourneyTrailsComponent);
