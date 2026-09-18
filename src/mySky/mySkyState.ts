import { buildSkyNodes } from '@/mySky/buildSkyNodes';
import { DEFAULT_MY_SKY_VISIBLE_LAYERS, type MySkyVisibleLayers } from '@/mySky/skyLayers';
import {
  EMPTY_SKY_EVOLUTION,
  type SkyEvolutionRecord,
  type SkyGrowthProfile,
} from '@/mySky/skyEvolution';
import type { JoinedCommunity } from '@/onboarding/personalization/communities/types';
import type { SkyNode, SkyPattern, SkyRelationship } from '@/mySky/skyNodeTypes';
import {
  filterVisibleStarNodes,
  projectNodeToStarDisplay,
} from '@/mySky/skyVisualRules';
import type { MySkyStarDisplay, MySkyState, MySkyView } from '@/mySky/types';
import type { UserPersonalizationProfile } from '@/onboarding/personalization/types';
import type { SkywriteRecord } from '@/skywrite/types';

/** Versioned snapshot — future backend sync without rewriting the screen. */
export const MY_SKY_STATE_VERSION = 2 as const;

/** Inputs that derive the My Sky graph — local-first, backend-replaceable. */
export interface MySkySources {
  northStarVision: string;
  skywrites: SkywriteRecord[];
  joinedCommunities: JoinedCommunity[];
  /** Explicit user goals — growth layer nodes only. */
  growthGoals: string[];
  /** Whether an active guiding light exists (explicit, not inferred). */
  guidanceActive: boolean;
  guidanceLabel?: string;
  /** Today's Focus — explicit user activity feeding growth layers. */
  todayFocusValue?: string | null;
  todayFocusReflection?: string | null;
  todayFocusDateKey?: string | null;
  todayFocusReflectionAt?: string | null;
  /** Local evolution history — backend-handoff ready. */
  evolution: SkyEvolutionRecord;
  lastUpdatedAt: string | null;
}

/** Normalized graph output — single internal representation before display projection. */
export interface MySkyGraph {
  nodes: SkyNode[];
  patterns: SkyPattern[];
  relationships: SkyRelationship[];
  vitality: number;
  growthProfile: SkyGrowthProfile;
  evolution: SkyEvolutionRecord;
  builtAt: string;
}

/** Serializable contract for future persistence — graph is re-derivable from sources. */
export interface MySkyPersistedSnapshot {
  version: typeof MY_SKY_STATE_VERSION;
  northStarVision: string;
  skywriteIds: string[];
  joinedCommunityNames: string[];
  lastUpdatedAt: string;
  evolutionEntryCount: number;
}

export function resolveMySkySources(
  profile: UserPersonalizationProfile,
  evolution: SkyEvolutionRecord = EMPTY_SKY_EVOLUTION,
): MySkySources {
  return {
    northStarVision: profile.northStar.originalVision,
    skywrites: profile.skywrites ?? [],
    joinedCommunities: profile.communities.joined,
    growthGoals: profile.goals ?? [],
    guidanceActive: Boolean(profile.guidingLight?.title?.trim()),
    guidanceLabel: profile.guidingLight?.title ?? undefined,
    todayFocusValue: profile.todayFocus?.value ?? null,
    todayFocusReflection: profile.todayFocus?.reflection ?? null,
    todayFocusDateKey: profile.todayFocus?.dateKey ?? null,
    todayFocusReflectionAt: profile.todayFocus?.reflectionUpdatedAt ?? null,
    evolution,
    lastUpdatedAt: profile.lastUpdatedAt,
  };
}

/** Build normalized graph from centralized sources — no UI concerns. */
export function buildMySkyGraph(sources: MySkySources): MySkyGraph {
  const { nodes, patterns, relationships, vitality, growthProfile } = buildSkyNodes(sources);

  return {
    nodes,
    patterns,
    relationships,
    vitality,
    growthProfile,
    evolution: sources.evolution,
    builtAt: new Date().toISOString(),
  };
}

function projectLegacyState(
  stars: MySkyStarDisplay[],
  patterns: SkyPattern[],
  connections: string[],
): MySkyState {
  const skyItems = stars.map((star) => ({
    id: star.id,
    type: star.type,
    title: star.title,
    timestamp: star.timestamp,
    visibility: star.visibility,
    constellationId: star.constellationId,
    sourceId: star.sourceId,
  }));

  const constellations = patterns.map((pattern) => ({
    id: pattern.id,
    label: pattern.label ?? 'Pattern',
    note: pattern.note ?? '',
    itemIds: pattern.nodeIds,
  }));

  const contributions = skyItems
    .filter((item) => item.type === 'contribution')
    .map((item) => item.title)
    .filter((title): title is string => Boolean(title));

  return {
    northStar: { originalVision: '' },
    skyItems,
    constellations,
    connections,
    contributions,
  };
}

/** Build full My Sky view — graph + display projection + session layer visibility. */
export function buildMySkyViewFromSources(
  sources: MySkySources,
  visibleLayers: MySkyVisibleLayers = DEFAULT_MY_SKY_VISIBLE_LAYERS,
): MySkyView {
  const graph = buildMySkyGraph(sources);
  const { growthProfile } = graph;
  const visibleNodes = filterVisibleStarNodes(graph.nodes, visibleLayers);
  const stars = visibleNodes.map((node) => projectNodeToStarDisplay(node));

  const joinedCommunityNames = sources.joinedCommunities.map((c) => c.name);
  const legacy = projectLegacyState(stars, graph.patterns, joinedCommunityNames);

  return {
    northStar: { originalVision: sources.northStarVision },
    skyItems: legacy.skyItems,
    constellations: legacy.constellations,
    connections: legacy.connections,
    contributions: legacy.contributions,
    nodes: graph.nodes,
    relationships: graph.relationships,
    patterns: graph.patterns,
    viewState: {
      visibleLayers: { ...visibleLayers },
      revealPatternId: null,
    },
    lastUpdatedAt: sources.lastUpdatedAt ?? graph.builtAt,
    vitality: graph.vitality,
    growthProfile,
    evolution: graph.evolution,
    stars,
  };
}

/** Apply arrival highlight to projected stars without mutating graph identity. */
export function applyArrivalHighlight(
  stars: MySkyStarDisplay[],
  highlightNodeId: string | null,
): MySkyStarDisplay[] {
  if (!highlightNodeId) return stars;
  return stars.map((star) => ({
    ...star,
    isNewlyAdded: star.id === highlightNodeId,
  }));
}

export function serializeMySkySnapshot(sources: MySkySources): MySkyPersistedSnapshot {
  return {
    version: MY_SKY_STATE_VERSION,
    northStarVision: sources.northStarVision,
    skywriteIds: sources.skywrites.map((post) => post.id),
    joinedCommunityNames: sources.joinedCommunities.map((c) => c.name),
    lastUpdatedAt: sources.lastUpdatedAt ?? new Date().toISOString(),
    evolutionEntryCount: sources.evolution.entries.length,
  };
}
