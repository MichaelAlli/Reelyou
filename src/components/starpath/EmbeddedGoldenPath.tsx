import { memo, useMemo } from 'react';
import { StyleSheet } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Path, Stop } from 'react-native-svg';

import {
  buildMainGoldenPathD,
  GOLDEN_PATH_OVERLAY_TOP_Y,
  REF_TRAVELER,
  STARPATH_CENTER_X,
} from '@/starpath/starpathReferenceLayout';
import type { StarPathLayoutMetrics } from '@/starpath/starpathLayoutMetrics';

interface EmbeddedGoldenPathProps {
  metrics: StarPathLayoutMetrics;
}

function EmbeddedGoldenPathComponent({ metrics }: EmbeddedGoldenPathProps) {
  const { pathD, sparks } = useMemo(() => {
    const pathD = buildMainGoldenPathD(metrics);
    const cx = metrics.worldWidth * STARPATH_CENTER_X;
    const y0 = metrics.paddingTop + metrics.contentBandHeight * REF_TRAVELER.y;
    const yTop = metrics.paddingTop + metrics.contentBandHeight * GOLDEN_PATH_OVERLAY_TOP_Y;

    const sparkYs = [0.2, 0.32, 0.44, 0.56, 0.68, 0.8, 0.92];
    const sparkPoints = sparkYs.map((t) => ({
      cx: cx + Math.sin(t * Math.PI * 1.15) * metrics.worldWidth * 0.022,
      cy: y0 + (yTop - y0) * t,
      r: 0.75 + (1 - t) * 0.65,
      o: 0.26 + (1 - t) * 0.42,
    }));

    return { pathD, sparks: sparkPoints };
  }, [metrics]);

  return (
    <Svg
      width={metrics.worldWidth}
      height={metrics.worldHeight}
      style={StyleSheet.absoluteFill}
      pointerEvents="none"
    >
      <Defs>
        <LinearGradient id="pathSheen" x1="50%" y1="100%" x2="50%" y2="0%">
          <Stop offset="0%" stopColor="#FFD57A" stopOpacity={0.1} />
          <Stop offset="45%" stopColor="#FFE8A8" stopOpacity={0.24} />
          <Stop offset="100%" stopColor="#FFF8E7" stopOpacity={0.12} />
        </LinearGradient>
      </Defs>
      <Path
        d={pathD}
        stroke="url(#pathSheen)"
        strokeWidth={10}
        strokeOpacity={0.32}
        fill="none"
        strokeLinecap="round"
      />
      <Path
        d={pathD}
        stroke="#FFE8A8"
        strokeWidth={2.25}
        strokeOpacity={0.22}
        fill="none"
        strokeLinecap="round"
      />
      <Path
        d={pathD}
        stroke="#FFF8E7"
        strokeWidth={1}
        strokeOpacity={0.2}
        fill="none"
        strokeLinecap="round"
      />
      {sparks.map((s, i) => (
        <Circle key={`spark-${i}`} cx={s.cx} cy={s.cy} r={s.r} fill="#FFF8E7" opacity={s.o} />
      ))}
    </Svg>
  );
}

export const EmbeddedGoldenPath = memo(EmbeddedGoldenPathComponent);
