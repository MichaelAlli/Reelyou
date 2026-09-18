import type { MySkyLayerId } from '@/mySky/skyLayers';
import type { MySkySources } from '@/mySky/mySkyState';
import type {
  SkyGrowthEventType,
  SkyNode,
  SkyPattern,
  SkyProvenanceSource,
} from '@/mySky/skyNodeTypes';
import { computeSkyNodeVisual } from '@/mySky/skyVisualRules';

/** Single evolution moment — backend-handoff ready, never shown as scores in UI. */
export interface SkyEvolutionEntry {
  id: string;
  eventType: SkyGrowthEventType;
  occurredAt: string;
  source: SkyProvenanceSource;
  nodeId?: string;
  patternId?: string;
  /** Calm summary for future history — not technical metadata. */
  summary: string;
}

export interface SkyEvolutionRecord {
  entries: SkyEvolutionEntry[];
  updatedAt: string | null;
}

export const EMPTY_SKY_EVOLUTION: SkyEvolutionRecord = {
  entries: [],
  updatedAt: null,
};

/** Derived growth signals — consumed by node builder and visual rules, not UI widgets. */
export interface SkyGrowthProfile {
  vitality: number;
  activityUnits: number;
  layerRelevance: Record<MySkyLayerId, number>;
}

const MAX_VITALITY = 1.35;
const PRIORITY_NODE_BUDGET = 8;

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

function sublinearVitality(units: number): number {
  return Math.min(MAX_VITALITY, 1 + Math.log1p(units) * 0.12);
}

function ageDays(iso: string): number {
  const ms = Date.now() - new Date(iso).getTime();
  if (!Number.isFinite(ms) || ms < 0) return 0;
  return ms / (1000 * 60 * 60 * 24);
}

/** Aggregate meaningful activity into calm growth signals. */
export function computeSkyGrowthProfile(sources: MySkySources): SkyGrowthProfile {
  const skywriteCount = sources.skywrites.length;
  const communityCount = sources.joinedCommunities.length;
  const growthCount = sources.growthGoals.length;
  const hasFocus = Boolean(sources.todayFocusValue?.trim());
  const hasReflection = Boolean(sources.todayFocusReflection?.trim());
  const evolutionCount = sources.evolution.entries.length;

  const activityUnits =
    skywriteCount +
    communityCount * 0.6 +
    growthCount * 0.35 +
    (hasFocus ? 0.4 : 0) +
    (hasReflection ? 0.8 : 0) +
    (sources.guidanceActive ? 0.3 : 0);

  const vitality = sublinearVitality(activityUnits);

  const layerRelevance: Record<MySkyLayerId, number> = {
    stars: clamp01(0.75 + Math.min(skywriteCount, 6) * 0.04),
    constellations: clamp01(0.2 + Math.min(skywriteCount, 4) * 0.12),
    communities: clamp01(communityCount > 0 ? 0.45 + communityCount * 0.12 : 0.15),
    connections: clamp01(communityCount > 0 ? 0.4 + communityCount * 0.1 : 0.12),
    growth: clamp01(growthCount > 0 ? 0.5 + growthCount * 0.1 : 0.1),
    impact: clamp01(skywriteCount >= 3 ? 0.35 : 0.08),
    guidance: sources.guidanceActive ? 0.85 : 0.1,
    temporal: clamp01(evolutionCount > 0 ? 0.25 + Math.min(evolutionCount, 12) * 0.04 : 0.05),
  };

  return { vitality, activityUnits, layerRelevance };
}

/** Higher score = more visual emphasis — explicit user actions win. */
export function scoreNodeVisualPriority(node: SkyNode): number {
  let score = 0;
  if (node.provenance.source === 'explicit') score += 12;
  if (node.userGenerated) score += 8;
  if (node.type === 'skywrite') score += 6;
  if (node.type === 'guidance') score += 4;
  if (node.type === 'reflection') score += 3;
  if (node.type === 'community' || node.type === 'relationship') score += 2;

  const days = ageDays(node.createdAt);
  if (days <= 2) score += 5;
  else if (days <= 7) score += 3;
  else if (days <= 21) score += 1;

  if (node.inferred) score -= 6;

  return score;
}

/** Keep the sky peaceful — dampen lower-priority nodes when activity grows. */
export function applyVisualPrioritization(
  nodes: SkyNode[],
  profile: SkyGrowthProfile,
): SkyNode[] {
  if (nodes.length <= PRIORITY_NODE_BUDGET) return nodes;

  const ranked = [...nodes]
    .map((node, index) => ({ node, index, score: scoreNodeVisualPriority(node) }))
    .sort((a, b) => b.score - a.score);

  const priorityIds = new Set(
    ranked.slice(0, PRIORITY_NODE_BUDGET).map((entry) => entry.node.id),
  );

  return nodes.map((node) => {
    if (priorityIds.has(node.id)) return node;

    const rankIndex = ranked.findIndex((entry) => entry.node.id === node.id);
    const dampen = 0.72 + Math.max(0, 0.2 - rankIndex * 0.008);

    return {
      ...node,
      visual: {
        ...node.visual,
        brightness: node.visual.brightness * dampen,
        glow: node.visual.glow * dampen,
        opacity: Math.min(node.visual.opacity, 0.62 + dampen * 0.28),
        emphasis: node.visual.emphasis * dampen,
      },
    };
  });
}

/** Derive emerging patterns from explicit metadata only — no inference UI. */
export function deriveActivityPatterns(
  nodes: SkyNode[],
  sources: MySkySources,
): SkyPattern[] {
  const skywriteNodes = nodes.filter((node) => node.type === 'skywrite');
  if (skywriteNodes.length < 2) return [];

  const now = new Date().toISOString();
  const patterns: SkyPattern[] = [];

  const moodGroups = new Map<string, string[]>();
  for (const node of skywriteNodes) {
    const mood = node.metadata?.mood;
    if (typeof mood !== 'string' || !mood) continue;
    const ids = moodGroups.get(mood) ?? [];
    ids.push(node.id);
    moodGroups.set(mood, ids);
  }

  for (const [mood, nodeIds] of moodGroups) {
    if (nodeIds.length < 2) continue;
    patterns.push({
      id: `pattern-mood-${mood}`,
      nodeIds,
      label: `Returning to ${mood}`,
      note: 'A gentle pattern is forming around moments with a similar feeling.',
      source: 'explicit',
      status: nodeIds.length >= 3 ? 'emerging' : 'possible',
      createdAt: now,
      updatedAt: now,
    });
  }

  if (sources.joinedCommunities.length >= 2) {
    const communityNodeIds = nodes
      .filter((node) => node.layer === 'communities' || node.layer === 'connections')
      .map((node) => node.id);
    if (communityNodeIds.length >= 2) {
      patterns.push({
        id: 'pattern-communities',
        nodeIds: communityNodeIds.slice(0, 4),
        label: 'Communities in orbit',
        note: 'Your sky holds more than one place you belong.',
        source: 'explicit',
        status: 'emerging',
        createdAt: now,
        updatedAt: now,
      });
    }
  }

  return patterns.slice(0, 3);
}

export function createEvolutionEntry(
  eventType: SkyGrowthEventType,
  options: {
    source?: SkyProvenanceSource;
    nodeId?: string;
    patternId?: string;
    summary: string;
    occurredAt?: string;
  },
): SkyEvolutionEntry {
  return {
    id: `evo-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    eventType,
    occurredAt: options.occurredAt ?? new Date().toISOString(),
    source: options.source ?? 'explicit',
    nodeId: options.nodeId,
    patternId: options.patternId,
    summary: options.summary,
  };
}

/** Recompute visuals for a node using growth vitality and optional emphasis. */
export function refreshNodeVisual(
  node: SkyNode,
  vitality: number,
  emphasisBoost = 0,
): SkyNode {
  const days = ageDays(node.createdAt);
  return {
    ...node,
    visual: computeSkyNodeVisual(node.type, node.visual.color, {
      vitality,
      emphasisBoost,
      ageDays: Math.min(days, 30),
    }),
  };
}
