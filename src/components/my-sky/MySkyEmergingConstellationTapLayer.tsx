import { memo, useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import type { SkyNode, SkyPattern, SkyRelationship } from '@/mySky/skyNodeTypes';

const MIN_EDGE_LENGTH = 12;

interface EdgeHit {
  key: string;
  left: number;
  top: number;
  width: number;
  height: number;
  rotationDeg: number;
  emergingCommunityId: string;
  groupName: string;
}

interface MySkyEmergingConstellationTapLayerProps {
  worldWidth: number;
  worldHeight: number;
  patterns: SkyPattern[];
  relationships: SkyRelationship[];
  nodes: SkyNode[];
  /** Match MySkyLivingSkyLayer — pattern links visible. */
  interactive: boolean;
  onEmergingGroupPress: (emergingCommunityId: string, groupName: string) => void;
}

function nodePosition(
  nodeById: Map<string, SkyNode>,
  nodeId: string,
  worldWidth: number,
  worldHeight: number,
): { x: number; y: number } | null {
  const node = nodeById.get(nodeId);
  if (!node) return null;
  return {
    x: node.position.x * worldWidth,
    y: node.position.y * worldHeight,
  };
}

function buildEdgeHits(
  patterns: SkyPattern[],
  relationships: SkyRelationship[],
  nodes: SkyNode[],
  worldWidth: number,
  worldHeight: number,
): EdgeHit[] {
  if (worldWidth <= 0 || worldHeight <= 0) return [];

  const emergingByPatternId = new Map(
    patterns
      .filter((pattern) => pattern.emergingCommunityId)
      .map((pattern) => [pattern.id, pattern] as const),
  );
  if (emergingByPatternId.size === 0) return [];

  const nodeById = new Map(nodes.map((node) => [node.id, node]));
  const hits: EdgeHit[] = [];

  for (const edge of relationships) {
    if (!edge.patternId) continue;
    const pattern = emergingByPatternId.get(edge.patternId);
    if (!pattern?.emergingCommunityId) continue;

    const from = nodePosition(nodeById, edge.fromNodeId, worldWidth, worldHeight);
    const to = nodePosition(nodeById, edge.toNodeId, worldWidth, worldHeight);
    if (!from || !to) continue;

    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const length = Math.hypot(dx, dy);
    if (length < MIN_EDGE_LENGTH) continue;

    const midX = (from.x + to.x) / 2;
    const midY = (from.y + to.y) / 2;

    const rotationDeg = (Math.atan2(dy, dx) * 180) / Math.PI;
    const stripLength = Math.max(36, length * 0.72);
    const stripHeight = 32;

    hits.push({
      key: edge.id,
      left: midX - stripLength / 2,
      top: midY - stripHeight / 2,
      width: stripLength,
      height: stripHeight,
      rotationDeg,
      emergingCommunityId: pattern.emergingCommunityId,
      groupName: pattern.label ?? 'Emerging Group',
    });
  }

  return hits;
}

function MySkyEmergingConstellationTapLayerComponent({
  worldWidth,
  worldHeight,
  patterns,
  relationships,
  nodes,
  interactive,
  onEmergingGroupPress,
}: MySkyEmergingConstellationTapLayerProps) {
  const [pressedKey, setPressedKey] = useState<string | null>(null);

  const edgeHits = useMemo(
    () => buildEdgeHits(patterns, relationships, nodes, worldWidth, worldHeight),
    [nodes, patterns, relationships, worldHeight, worldWidth],
  );

  if (!interactive || edgeHits.length === 0) return null;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      {edgeHits.map((hit) => (
        <Pressable
          key={hit.key}
          accessibilityRole="button"
          accessibilityLabel={`Open Emerging Group: ${hit.groupName}`}
          onPressIn={() => setPressedKey(hit.key)}
          onPressOut={() => setPressedKey(null)}
          onPress={() => onEmergingGroupPress(hit.emergingCommunityId, hit.groupName)}
          style={[
            styles.edgeHit,
            {
              left: hit.left,
              top: hit.top,
              width: hit.width,
              height: hit.height,
              transform: [{ rotate: `${hit.rotationDeg}deg` }],
              backgroundColor:
                pressedKey === hit.key ? 'rgba(196, 168, 255, 0.14)' : 'transparent',
            },
          ]}
        />
      ))}
    </View>
  );
}

export const MySkyEmergingConstellationTapLayer = memo(MySkyEmergingConstellationTapLayerComponent);

const styles = StyleSheet.create({
  edgeHit: {
    position: 'absolute',
    borderRadius: 16,
  },
});
