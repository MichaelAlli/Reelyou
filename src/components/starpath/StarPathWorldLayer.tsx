import { memo, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';

import { EmbeddedGoldenPath } from '@/components/starpath/EmbeddedGoldenPath';
import { HumanPortraitNode } from '@/components/starpath/HumanPortraitNode';
import { JourneyTraveler } from '@/components/starpath/JourneyTraveler';
import { NorthStarLabel } from '@/components/starpath/NorthStarLabel';
import { OrganicJourneyTrails } from '@/components/starpath/OrganicJourneyTrails';
import { StarPathCinematicBackground } from '@/components/starpath/StarPathCinematicBackground';
import { StarPathDepthOverlay } from '@/components/starpath/StarPathDepthOverlay';
import { StarPathWorldExtensionFill } from '@/components/starpath/StarPathWorldExtensionFill';
import { SymbolicJourneyNode } from '@/components/starpath/SymbolicJourneyNode';
import type { StarPathLayoutMetrics } from '@/starpath/starpathLayoutMetrics';
import { refPointToWorldPx } from '@/starpath/starpathLayoutMetrics';
import type { StarPathViewportWindow } from '@/starpath/starpathWorldVisibility';
import {
  projectVisiblePortraitNodes,
  projectVisibleSymbolNodes,
  shouldRenderNode,
} from '@/starpath/starpathWorldVisibility';
import type { StarPathWorldGraph } from '@/starpath/starpathWorldModel';

interface StarPathWorldLayerProps {
  metrics: StarPathLayoutMetrics;
  graph: StarPathWorldGraph;
  viewportWindow: StarPathViewportWindow;
  onNodePress: (id: string) => void;
  onAvatarPress: () => void;
}

function StarPathWorldLayerComponent({
  metrics,
  graph,
  viewportWindow,
  onNodePress,
  onAvatarPress,
}: StarPathWorldLayerProps) {
  const portraits = useMemo(
    () => projectVisiblePortraitNodes(graph.portraitNodes, metrics, viewportWindow),
    [graph.portraitNodes, metrics, viewportWindow],
  );

  const symbols = useMemo(
    () => projectVisibleSymbolNodes(graph.symbolNodes, metrics, viewportWindow),
    [graph.symbolNodes, metrics, viewportWindow],
  );

  const traveler = useMemo(
    () => refPointToWorldPx(graph.traveler, metrics),
    [graph.traveler, metrics],
  );

  const northStar = useMemo(
    () => refPointToWorldPx(graph.northStarLabel, metrics),
    [graph.northStarLabel, metrics],
  );

  const emerged = useMemo(() => new Set(graph.recentlyEmergedIds), [graph.recentlyEmergedIds]);

  return (
    <View
      style={[styles.layer, { width: metrics.worldWidth, height: metrics.worldHeight }]}
      testID="starpath-scroll-surface"
    >
      <StarPathWorldExtensionFill metrics={metrics} />
      <StarPathCinematicBackground metrics={metrics} />
      <StarPathDepthOverlay width={metrics.worldWidth} height={metrics.worldHeight} />
      <EmbeddedGoldenPath metrics={metrics} />
      <OrganicJourneyTrails metrics={metrics} branches={graph.branches} />

      <NorthStarLabel x={northStar.x} y={northStar.y} />

      <JourneyTraveler x={traveler.x} y={traveler.y} onPress={onAvatarPress} />

      {portraits.map((node) =>
        shouldRenderNode(node.presence) ? (
          <HumanPortraitNode
            key={node.id}
            id={node.id}
            x={node.worldX}
            y={node.worldY}
            ringColor={node.ringColor}
            portraitSeed={node.portraitSeed}
            visualOpacity={node.visualOpacity}
            revealPulse={emerged.has(node.id)}
            onPress={onNodePress}
          />
        ) : null,
      )}

      {symbols.map((node) =>
        shouldRenderNode(node.presence) ? (
          <SymbolicJourneyNode
            key={node.id}
            id={node.id}
            x={node.worldX}
            y={node.worldY}
            ringColor={node.ringColor}
            icon={node.icon}
            size={node.size}
            visualOpacity={node.visualOpacity}
            revealPulse={emerged.has(node.id)}
            onPress={onNodePress}
          />
        ) : null,
      )}
    </View>
  );
}

export const StarPathWorldLayer = memo(StarPathWorldLayerComponent);

const styles = StyleSheet.create({
  layer: {
    position: 'relative',
  },
});
