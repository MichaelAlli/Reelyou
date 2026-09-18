import type { SkyConnectionStatus } from '@/mySky/skyIdentity';
import type { SkyNode, SkyPattern } from '@/mySky/skyNodeTypes';
import type { MySkyView } from '@/mySky/types';
import type { Privacy } from '@/types';

/** Whether a node may appear in a visitor-facing Public Sky. */
export function isPublicSkyNodeVisible(
  node: SkyNode,
  connectionStatus: SkyConnectionStatus,
): boolean {
  if (node.type === 'identity') return true;
  if (node.layer === 'guidance') return false;

  const visibility = node.visibility as Privacy | undefined;
  if (!visibility || visibility === 'public') return true;
  if (visibility === 'private') return false;
  if (visibility === 'orbit') return connectionStatus === 'connected';

  return false;
}

/** Strip private nodes and owner-scoped patterns for visitor view. */
export function filterPublicSkyView(
  view: MySkyView,
  connectionStatus: SkyConnectionStatus,
): MySkyView {
  const visibleNodes = view.nodes.filter((node) =>
    isPublicSkyNodeVisible(node, connectionStatus),
  );
  const visibleNodeIds = new Set(visibleNodes.map((node) => node.id));

  const patterns = view.patterns
    .map((pattern) => ({
      ...pattern,
      nodeIds: pattern.nodeIds.filter((id) => visibleNodeIds.has(id)),
    }))
    .filter((pattern) => pattern.nodeIds.length > 0);

  const patternIds = new Set(patterns.map((pattern) => pattern.id));
  const relationships = view.relationships.filter(
    (rel) => visibleNodeIds.has(rel.fromNodeId) && visibleNodeIds.has(rel.toNodeId),
  );

  const stars = view.stars.filter((star) => visibleNodeIds.has(star.id));

  return {
    ...view,
    nodes: visibleNodes,
    patterns,
    relationships,
    stars,
    constellations: view.constellations.filter((entry) =>
      entry.itemIds.some((id) => visibleNodeIds.has(id)),
    ),
  };
}

export function findPublicPatternForNode(
  patterns: SkyPattern[],
  nodeId: string,
): SkyPattern | null {
  return patterns.find((pattern) => pattern.nodeIds.includes(nodeId)) ?? null;
}
