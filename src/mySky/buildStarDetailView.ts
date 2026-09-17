import { MY_SKY_LAYER_LABELS } from '@/constants/mySkyLayers';
import { SKYWRITE_VISIBILITY_OPTIONS } from '@/constants/skywriteCopy';
import type { SkyNode, SkyNodeType, SkyPattern } from '@/mySky/skyNodeTypes';

/** User-facing star detail — no internal ids, scores, or AI metadata. */
export interface StarDetailViewModel {
  title: string;
  typeLabel: string;
  categoryLabel: string;
  dateLabel: string | null;
  context: string | null;
  patternLabel: string | null;
  visibilityLabel: string | null;
  isSparse: boolean;
}

const NODE_TYPE_LABELS: Record<SkyNodeType, string> = {
  skywrite: 'Skywrite',
  reflection: 'Reflection',
  community: 'Community',
  relationship: 'Connection',
  growth: 'Growth',
  impact: 'Contribution',
  guidance: 'Guidance',
};

const TYPE_CONTEXT: Partial<Record<SkyNodeType, string>> = {
  community: 'A community you’ve brought into your sky.',
  relationship: 'A connection woven into your sky.',
  growth: 'Something you’re growing toward.',
  guidance: 'Your guiding light right now.',
  impact: 'A moment of contribution in your sky.',
  reflection: 'A quiet reflection in your sky.',
};

function formatStarDate(iso: string): string | null {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return null;
  }
}

function resolveVisibilityLabel(visibility: string | undefined): string | null {
  if (!visibility) return null;
  return (
    SKYWRITE_VISIBILITY_OPTIONS.find((option) => option.id === visibility)?.title ?? null
  );
}

export function findSkyNodeById(
  nodes: SkyNode[],
  nodeId: string | undefined,
): SkyNode | null {
  if (!nodeId) return null;
  return nodes.find((node) => node.id === nodeId) ?? null;
}

export function findPatternForNode(
  patterns: SkyPattern[],
  nodeId: string,
): SkyPattern | null {
  return patterns.find((pattern) => pattern.nodeIds.includes(nodeId)) ?? null;
}

/** Project a SkyNode into calm, user-facing detail copy. */
export function buildStarDetailView(
  node: SkyNode,
  pattern: SkyPattern | null,
): StarDetailViewModel {
  const title = node.title?.trim() || 'A light in your sky';
  const typeLabel = NODE_TYPE_LABELS[node.type] ?? 'Moment';
  const categoryLabel = MY_SKY_LAYER_LABELS[node.layer] ?? 'Stars';
  const dateLabel = formatStarDate(node.createdAt);
  const patternLabel = pattern?.label?.trim() || null;

  const context =
    pattern?.note?.trim() ||
    TYPE_CONTEXT[node.type] ||
    (title === 'A light in your sky' ? 'This star is part of your living sky.' : null);

  const visibilityLabel = resolveVisibilityLabel(node.visibility);
  const isSparse = !node.title?.trim() && !context && !patternLabel && !visibilityLabel;

  return {
    title,
    typeLabel,
    categoryLabel,
    dateLabel,
    context,
    patternLabel,
    visibilityLabel,
    isSparse,
  };
}
