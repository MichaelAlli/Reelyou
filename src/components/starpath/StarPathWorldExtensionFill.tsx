import { memo } from 'react';
import { StyleSheet } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

import type { StarPathLayoutMetrics } from '@/starpath/starpathLayoutMetrics';

interface StarPathWorldExtensionFillProps {
  metrics: StarPathLayoutMetrics;
}

/** Atmospheric continuation above/below the cinematic band — not part of the master artwork. */
function StarPathWorldExtensionFillComponent({ metrics }: StarPathWorldExtensionFillProps) {
  const { worldWidth, worldHeight, paddingTop, paddingBottom } = metrics;

  if (paddingTop <= 0 && paddingBottom <= 0) return null;

  return (
    <Svg width={worldWidth} height={worldHeight} style={StyleSheet.absoluteFill} pointerEvents="none">
      <Defs>
        <LinearGradient id="spWorldTopExt" x1="0%" y1="100%" x2="0%" y2="0%">
          <Stop offset="0%" stopColor="#0C1230" stopOpacity={1} />
          <Stop offset="100%" stopColor="#060818" stopOpacity={1} />
        </LinearGradient>
        <LinearGradient id="spWorldBottomExt" x1="0%" y1="0%" x2="0%" y2="100%">
          <Stop offset="0%" stopColor="#030510" stopOpacity={0.95} />
          <Stop offset="55%" stopColor="#050812" stopOpacity={1} />
          <Stop offset="100%" stopColor="#020308" stopOpacity={1} />
        </LinearGradient>
      </Defs>
      {paddingTop > 0 ? (
        <Rect x={0} y={0} width={worldWidth} height={paddingTop} fill="url(#spWorldTopExt)" />
      ) : null}
      {paddingBottom > 0 ? (
        <Rect
          x={0}
          y={worldHeight - paddingBottom}
          width={worldWidth}
          height={paddingBottom}
          fill="url(#spWorldBottomExt)"
        />
      ) : null}
    </Svg>
  );
}

export const StarPathWorldExtensionFill = memo(StarPathWorldExtensionFillComponent);
