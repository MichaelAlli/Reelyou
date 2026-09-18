import type { SkyNode, SkyPattern } from '@/mySky/skyNodeTypes';
import type { MySkyStarDisplay } from '@/mySky/types';

export interface ConstellationConnectedStar {
  nodeId: string;
  title: string;
  typeLabel: string;
}

export interface ConstellationDetailView {
  label: string;
  reason: string;
  connectedStars: ConstellationConnectedStar[];
}

const TYPE_LABELS: Record<string, string> = {
  skywrite: 'Skywrite',
  reflection: 'Reflection',
  community: 'Community',
  relationship: 'Connection',
  growth: 'Growth',
  impact: 'Contribution',
  guidance: 'Guidance',
};

function resolveTypeLabel(node: SkyNode): string {
  return TYPE_LABELS[node.type] ?? 'Moment';
}

/** Human-readable constellation detail — no ids, scores, or inference metadata. */
export function buildConstellationDetailView(
  pattern: SkyPattern,
  nodes: SkyNode[],
  stars: MySkyStarDisplay[],
): ConstellationDetailView {
  const nodeById = new Map(nodes.map((node) => [node.id, node]));
  const starById = new Map(stars.map((star) => [star.id, star]));

  const connectedStars = pattern.nodeIds
    .map((nodeId) => {
      const node = nodeById.get(nodeId);
      const star = starById.get(nodeId);
      if (!node || node.type === 'identity') return null;
      return {
        nodeId,
        title: star?.title?.trim() || node.title?.trim() || 'A light in your sky',
        typeLabel: resolveTypeLabel(node),
      };
    })
    .filter((entry): entry is ConstellationConnectedStar => entry !== null);

  return {
    label: pattern.label?.trim() || 'A pattern in your sky',
    reason:
      pattern.note?.trim() ||
      'These stars are connected by meaningful threads in your journey.',
    connectedStars,
  };
}
