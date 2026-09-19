import type { SkyConnectionStatus } from '@/mySky/skyIdentity';
import type { SkyNode, SkyPattern } from '@/mySky/skyNodeTypes';
import type { MySkyView } from '@/mySky/types';
import type { Privacy } from '@/types';

import {
  resolveEffectiveNodeVisibility,
  type SkyVisibilitySettings,
} from './skyVisibilitySettings';

function isPatternVisible(
  pattern: SkyPattern,
  connectionStatus: SkyConnectionStatus,
): boolean {
  const visibility = pattern.visibility as Privacy | undefined;
  if (!visibility || visibility === 'public') return true;
  if (visibility === 'private') return false;
  if (visibility === 'orbit') return connectionStatus === 'connected';
  return false;
}

/** Whether a node may appear in a visitor-facing Public Sky. */
export function isPublicSkyNodeVisible(
  node: SkyNode,
  connectionStatus: SkyConnectionStatus,
  settings?: SkyVisibilitySettings,
): boolean {
  if (node.type === 'identity') return true;
  if (node.layer === 'guidance') return false;

  const visibility = settings
    ? resolveEffectiveNodeVisibility(node, settings)
    : ((node.visibility as Privacy | undefined) ?? 'private');

  if (visibility === 'public') return true;
  if (visibility === 'private') return false;
  if (visibility === 'orbit') return connectionStatus === 'connected';

  return false;
}

/** Strip private nodes and owner-scoped patterns for visitor view. */
export function filterPublicSkyView(
  view: MySkyView,
  connectionStatus: SkyConnectionStatus,
  settings?: SkyVisibilitySettings,
): MySkyView {
  const visibleNodes = view.nodes.filter((node) =>
    isPublicSkyNodeVisible(node, connectionStatus, settings),
  );
  const visibleNodeIds = new Set(visibleNodes.map((node) => node.id));

  const patterns = view.patterns
    .filter((pattern) => isPatternVisible(pattern, connectionStatus))
    .map((pattern) => ({
      ...pattern,
      nodeIds: pattern.nodeIds.filter((id) => visibleNodeIds.has(id)),
    }))
    .filter((pattern) => pattern.nodeIds.length > 0);

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
