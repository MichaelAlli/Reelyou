import { buildSkyNodes } from '@/mySky/buildSkyNodes';
import { DEFAULT_MY_SKY_VISIBLE_LAYERS } from '@/mySky/skyLayers';
import {
  filterVisibleStarNodes,
  projectNodeToStarDisplay,
} from '@/mySky/skyVisualRules';
import type { MySkyState, MySkyView } from '@/mySky/types';
import type { UserPersonalizationProfile } from '@/onboarding/personalization/types';

/** Build full My Sky view — normalized graph + derived display + calm default layers. */
export function buildMySkyView(profile: UserPersonalizationProfile): MySkyView {
  const { nodes, patterns, relationships, vitality } = buildSkyNodes(profile);

  const visibleNodes = filterVisibleStarNodes(nodes, DEFAULT_MY_SKY_VISIBLE_LAYERS);
  const stars = visibleNodes.map((node) => projectNodeToStarDisplay(node));

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

  const connections = profile.communities.joined.map((c) => c.name);
  const contributions = skyItems
    .filter((item) => item.type === 'contribution')
    .map((item) => item.title)
    .filter((title): title is string => Boolean(title));

  const state: MySkyState = {
    northStar: { originalVision: profile.northStar.originalVision },
    skyItems,
    constellations,
    connections,
    contributions,
  };

  return {
    ...state,
    nodes,
    relationships,
    patterns,
    viewState: {
      visibleLayers: { ...DEFAULT_MY_SKY_VISIBLE_LAYERS },
      revealPatternId: null,
    },
    lastUpdatedAt: profile.lastUpdatedAt ?? new Date().toISOString(),
    vitality,
    stars,
  };
}
