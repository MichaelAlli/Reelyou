import { memo, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';

import { HumanPortraitNode } from '@/components/starpath/HumanPortraitNode';
import { OrganicJourneyTrails } from '@/components/starpath/OrganicJourneyTrails';
import { SymbolicJourneyNode } from '@/components/starpath/SymbolicJourneyNode';
import type { StarPathLayoutMetrics } from '@/starpath/starpathLayoutMetrics';
import { refPointToWorldPx } from '@/starpath/starpathLayoutMetrics';
import { dynamicBranchesToRenderSpecs } from '@/starpath/starpathDynamicWorldEngine';
import type { JourneyNode, StarPathDynamicWorldState } from '@/starpath/starpathDynamicWorldTypes';
import type { StarPathNodeUiState } from '@/starpath/starpathInteractionTypes';

interface StarPathDynamicGrowthLayerProps {
  metrics: StarPathLayoutMetrics;
  dynamicWorld: StarPathDynamicWorldState;
  recentlyEmergedIds: Set<string>;
  activeBranchIds: Set<string>;
  nodeInteractionProps: (nodeId: string) => {
    uiState: StarPathNodeUiState;
    visualOpacity: number;
    showSelectionRing: boolean;
    softPulse: boolean;
    revealPulse: boolean;
  };
  onNodePress: (id: string) => void;
}

function emergenceOpacity(state: JourneyNode['emergenceState'], base: number): number {
  switch (state) {
    case 'receding':
      return base * 0.72;
    case 'emerging':
      return base * 0.92;
    case 'hidden':
    case 'summarized':
      return 0;
    default:
      return base;
  }
}

function StarPathDynamicGrowthLayerComponent({
  metrics,
  dynamicWorld,
  recentlyEmergedIds,
  activeBranchIds,
  nodeInteractionProps,
  onNodePress,
}: StarPathDynamicGrowthLayerProps) {
  const dynamicBranches = useMemo(
    () => dynamicBranchesToRenderSpecs(dynamicWorld.branchExtensions),
    [dynamicWorld.branchExtensions],
  );

  const visibleNodes = useMemo(
    () =>
      dynamicWorld.nodes.filter((n) =>
        ['emerging', 'active', 'settled', 'receding'].includes(n.emergenceState),
      ),
    [dynamicWorld.nodes],
  );

  if (!visibleNodes.length && !dynamicBranches.length) return null;

  return (
    <View style={styles.layer} pointerEvents="box-none">
      {dynamicBranches.length ? (
        <OrganicJourneyTrails
          metrics={metrics}
          branches={dynamicBranches}
          activeBranchIds={activeBranchIds}
        />
      ) : null}
      {visibleNodes.map((node) => {
        const { x, y } = refPointToWorldPx({ x: node.refX, y: node.refY }, metrics);
        const interaction = nodeInteractionProps(node.sourceId);
        const opacity = emergenceOpacity(node.emergenceState, interaction.visualOpacity);
        const reveal = recentlyEmergedIds.has(node.id) || interaction.revealPulse;

        if (node.type === 'portrait') {
          return (
            <HumanPortraitNode
              key={node.id}
              id={node.id}
              x={x}
              y={y}
              ringColor={node.ringColor}
              portraitSeed={node.portraitSeed ?? 8}
              visualOpacity={opacity}
              revealPulse={reveal}
              showSelectionRing={interaction.showSelectionRing}
              softPulse={interaction.softPulse || node.emergenceState === 'emerging'}
              onPress={onNodePress}
            />
          );
        }

        return (
          <SymbolicJourneyNode
            key={node.id}
            id={node.id}
            x={x}
            y={y}
            ringColor={node.ringColor}
            icon={node.icon ?? '◎'}
            size="md"
            visualOpacity={opacity}
            revealPulse={reveal}
            showSelectionRing={interaction.showSelectionRing}
            softPulse={interaction.softPulse || node.emergenceState === 'emerging'}
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

export const StarPathDynamicGrowthLayer = memo(StarPathDynamicGrowthLayerComponent);
