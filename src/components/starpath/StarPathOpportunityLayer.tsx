import { memo, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';

import { SymbolicJourneyNode } from '@/components/starpath/SymbolicJourneyNode';
import type { PlacedOpportunityNode } from '@/starpath/starpathOpportunityTypes';
import type { StarPathLayoutMetrics } from '@/starpath/starpathLayoutMetrics';
import { refPointToWorldPx } from '@/starpath/starpathLayoutMetrics';
import type { StarPathAmbientSignal } from '@/starpath/starpathSignalTypes';

interface StarPathOpportunityLayerProps {
  metrics: StarPathLayoutMetrics;
  placedNodes: PlacedOpportunityNode[];
  signalsById: Record<string, StarPathAmbientSignal>;
  activeSignalIds: string[];
  highlightNodeId?: string | null;
  onNodePress: (nodeId: string) => void;
}

function signalForNode(
  nodeId: string,
  signalsById: Record<string, StarPathAmbientSignal>,
  activeSignalIds: string[],
): StarPathAmbientSignal | undefined {
  const id = `sig-${nodeId}`;
  if (!activeSignalIds.includes(id)) return undefined;
  return signalsById[id];
}

function StarPathOpportunityLayerComponent({
  metrics,
  placedNodes,
  signalsById,
  activeSignalIds,
  highlightNodeId,
  onNodePress,
}: StarPathOpportunityLayerProps) {
  const visible = useMemo(
    () => placedNodes.filter((n) => n.prominence !== 'hidden'),
    [placedNodes],
  );

  if (!visible.length) return null;

  return (
    <View style={styles.layer} pointerEvents="box-none" testID="starpath-opportunity-layer">
      {visible.map((node) => {
        const { x, y } = refPointToWorldPx({ x: node.refX, y: node.refY }, metrics);
        const signal = signalForNode(node.nodeId, signalsById, activeSignalIds);
        const level = signal?.signalLevel ?? 'whisper';
        const softPulse = level === 'notice' || level === 'guide' || level === 'priority';
        const revealPulse = level === 'priority' || highlightNodeId === node.nodeId;
        const halo = level === 'guide' || level === 'priority' || signal?.signalType === 'halo';

        return (
          <SymbolicJourneyNode
            key={node.nodeId}
            id={node.nodeId}
            x={x}
            y={y}
            ringColor={node.ringColor}
            icon={node.iconKey}
            size={node.prominence === 'primary' ? 'lg' : 'md'}
            visualOpacity={node.prominence === 'comparison' ? 0.92 : 1}
            revealPulse={revealPulse}
            softPulse={softPulse || halo}
            showSelectionRing={highlightNodeId === node.nodeId}
            onPress={onNodePress}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  layer: {
    ...StyleSheet.absoluteFill,
  },
});

export const StarPathOpportunityLayer = memo(StarPathOpportunityLayerComponent);
