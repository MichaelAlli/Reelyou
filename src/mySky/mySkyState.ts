import { buildSkyNodes } from '@/mySky/buildSkyNodes';
import { DEFAULT_MY_SKY_VISIBLE_LAYERS } from '@/mySky/skyLayers';
import type { SkyNode, SkyPattern, SkyRelationship } from '@/mySky/skyNodeTypes';
import {
  filterVisibleStarNodes,
  projectNodeToStarDisplay,
} from '@/mySky/skyVisualRules';
import type { MySkyStarDisplay, MySkyState, MySkyView } from '@/mySky/types';
import type { UserPersonalizationProfile } from '@/onboarding/personalization/types';
import type { SkywriteRecord } from '@/skywrite/types';

/** Versioned snapshot — future backend sync without rewriting the screen. */
export const MY_SKY_STATE_VERSION = 1 as const;

/** Inputs that derive the My Sky graph — local-first, backend-replaceable. */
export interface MySkySources {
  northStarVision: string;
  skywrites: SkywriteRecord[];
  joinedCommunityNames: string[];
  lastUpdatedAt: string | null;
}

/** Normalized graph output — single internal representation before display projection. */
export interface MySkyGraph {
  nodes: SkyNode[];
  patterns: SkyPattern[];
  relationships: SkyRelationship[];
  vitality: number;
  builtAt: string;
}

/** Serializable contract for future persistence — graph is re-derivable from sources. */
export interface MySkyPersistedSnapshot {
  version: typeof MY_SKY_STATE_VERSION;
  northStarVision: string;
  skywriteIds: string[];
  joinedCommunityNames: string[];
  lastUpdatedAt: string;
}

export function resolveMySkySources(profile: UserPersonalizationProfile): MySkySources {
  return {
    northStarVision: profile.northStar.originalVision,
    skywrites: profile.skywrites ?? [],
    joinedCommunityNames: profile.communities.joined.map((c) => c.name),
    lastUpdatedAt: profile.lastUpdatedAt,
  };
}

/** Build normalized graph from centralized sources — no UI concerns. */
export function buildMySkyGraph(sources: MySkySources): MySkyGraph {
  const { nodes, patterns, relationships, vitality } = buildSkyNodes(sources);

  return {
    nodes,
    patterns,
    relationships,
    vitality,
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

/** Build full My Sky view — graph + display projection + calm default layers. */
export function buildMySkyViewFromSources(sources: MySkySources): MySkyView {
  const graph = buildMySkyGraph(sources);
  const visibleNodes = filterVisibleStarNodes(graph.nodes, DEFAULT_MY_SKY_VISIBLE_LAYERS);
  const stars = visibleNodes.map((node) => projectNodeToStarDisplay(node));

  const legacy = projectLegacyState(stars, graph.patterns, sources.joinedCommunityNames);

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
      visibleLayers: { ...DEFAULT_MY_SKY_VISIBLE_LAYERS },
      revealPatternId: null,
    },
    lastUpdatedAt: sources.lastUpdatedAt ?? graph.builtAt,
    vitality: graph.vitality,
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
    joinedCommunityNames: sources.joinedCommunityNames,
    lastUpdatedAt: sources.lastUpdatedAt ?? new Date().toISOString(),
  };
}
