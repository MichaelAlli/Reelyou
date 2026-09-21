import type { MySkySources } from '@/mySky/mySkyState';
import type { SkyNode } from '@/mySky/skyNodeTypes';

import type { SharedSkyParticipationSignal } from '@/sharedSky/sharedSkyTypes';

/** Explicit participation only — no passive impression scoring. */
export function deriveParticipationSignals(
  sources: MySkySources,
  nodes: SkyNode[],
): SharedSkyParticipationSignal[] {
  const signals: SharedSkyParticipationSignal[] = [];
  const nodeBySource = new Map<string, SkyNode>();

  for (const node of nodes) {
    if (node.sourceId) {
      nodeBySource.set(node.sourceId, node);
    }
  }

  for (const post of sources.skywrites) {
    const node = nodeBySource.get(post.id);
    if (!node) continue;
    signals.push({
      nodeId: node.id,
      kind: 'authored',
      weight: 'strong',
      lastAt: post.createdAt,
    });
  }

  for (const communityId of sources.participatingCommunityIds) {
    const node = nodes.find(
      (entry) => entry.type === 'community' && entry.sourceId === communityId,
    );
    if (!node) continue;
    signals.push({
      nodeId: node.id,
      kind: 'contributed',
      weight: 'strong',
      lastAt: node.createdAt,
    });
  }

  for (const joined of sources.joinedCommunities) {
    const node = nodes.find(
      (entry) => entry.type === 'community' && entry.title === joined.name,
    );
    if (!node) continue;
    signals.push({
      nodeId: node.id,
      kind: 'joined',
      weight: 'strong',
      lastAt: node.createdAt,
    });
  }

  return signals;
}

export function participationWeightForNode(
  signals: SharedSkyParticipationSignal[],
  nodeId: string,
): number {
  const hits = signals.filter((signal) => signal.nodeId === nodeId);
  if (hits.length === 0) return 0;
  return hits.some((hit) => hit.weight === 'strong') ? 3 : 1;
}
