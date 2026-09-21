import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { StarPathSpacing } from '@/components/starpath/starpathGlass';
import type { StarPathOffscreenGrowthHint } from '@/starpath/starpathDynamicWorldTypes';

interface StarPathOffscreenGrowthIndicatorProps {
  hints: StarPathOffscreenGrowthHint[];
  /** When true, suppress duplicate lower hint (signal indicator owns "Along the path below"). */
  hideBelow?: boolean;
}

function StarPathOffscreenGrowthIndicatorComponent({
  hints,
  hideBelow = false,
}: StarPathOffscreenGrowthIndicatorProps) {
  if (!hints.length) return null;
  const below = !hideBelow && hints.some((h) => h.direction === 'below');
  const above = hints.some((h) => h.direction === 'above');

  return (
    <View style={styles.wrap} pointerEvents="none" testID="starpath-growth-offscreen-hint">
      {below ? (
        <View style={styles.edgeBelow}>
          <View style={styles.glow} />
          <Text style={styles.label}>New path below</Text>
        </View>
      ) : null}
      {above ? (
        <View style={styles.edgeAbove}>
          <View style={styles.glow} />
          <Text style={styles.label}>Path continues above</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    ...StyleSheet.absoluteFill,
    zIndex: 20,
  },
  edgeBelow: {
    position: 'absolute',
    left: StarPathSpacing.guideLeft,
    right: StarPathSpacing.guideLeft,
    bottom: 96,
    alignItems: 'center',
  },
  edgeAbove: {
    position: 'absolute',
    left: StarPathSpacing.guideLeft,
    right: StarPathSpacing.guideLeft,
    top: 72,
    alignItems: 'center',
  },
  glow: {
    width: 48,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(232, 200, 114, 0.35)',
    marginBottom: 4,
  },
  label: {
    fontSize: 11,
    letterSpacing: 0.6,
    color: 'rgba(255,255,255,0.42)',
    textTransform: 'uppercase',
  },
});

export const StarPathOffscreenGrowthIndicator = memo(StarPathOffscreenGrowthIndicatorComponent);
