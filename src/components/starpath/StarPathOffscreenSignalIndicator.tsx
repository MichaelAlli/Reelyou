import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { StarPathSpacing } from '@/components/starpath/starpathGlass';
import type { StarPathAmbientSignal } from '@/starpath/starpathSignalTypes';

interface StarPathOffscreenSignalIndicatorProps {
  signals: StarPathAmbientSignal[];
  onNavigateToNode: (nodeId: string) => void;
}

function StarPathOffscreenSignalIndicatorComponent({
  signals,
  onNavigateToNode,
}: StarPathOffscreenSignalIndicatorProps) {
  const directional = signals.filter(
    (s) => s.signalType === 'directional_light' && s.offscreenDirection && s.sourceNodeId,
  );
  if (!directional.length) return null;

  const below = directional.find((s) => s.offscreenDirection === 'below');
  const above = directional.find((s) => s.offscreenDirection === 'above');

  return (
    <View style={styles.wrap} pointerEvents="box-none" testID="starpath-offscreen-signal">
      {below ? (
        <Pressable
          style={styles.edgeBelow}
          onPress={() => onNavigateToNode(below.sourceNodeId)}
          accessibilityRole="button"
          accessibilityLabel="Something relevant below on your path"
        >
          <View style={styles.glow} />
          <Text style={styles.label}>Along the path below</Text>
        </Pressable>
      ) : null}
      {above ? (
        <Pressable
          style={styles.edgeAbove}
          onPress={() => onNavigateToNode(above.sourceNodeId)}
          accessibilityRole="button"
          accessibilityLabel="Something relevant above on your path"
        >
          <View style={styles.glow} />
          <Text style={styles.label}>Along the path above</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    ...StyleSheet.absoluteFill,
    zIndex: 22,
  },
  edgeBelow: {
    position: 'absolute',
    left: StarPathSpacing.guideLeft,
    right: StarPathSpacing.guideLeft,
    bottom: 108,
    alignItems: 'center',
  },
  edgeAbove: {
    position: 'absolute',
    left: StarPathSpacing.guideLeft,
    right: StarPathSpacing.guideLeft,
    top: 76,
    alignItems: 'center',
  },
  glow: {
    width: 52,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(180, 210, 255, 0.42)',
    marginBottom: 4,
  },
  label: {
    fontSize: 11,
    letterSpacing: 0.6,
    color: 'rgba(255,255,255,0.48)',
    textTransform: 'uppercase',
  },
});

export const StarPathOffscreenSignalIndicator = memo(StarPathOffscreenSignalIndicatorComponent);
