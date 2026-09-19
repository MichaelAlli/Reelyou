import { applyPatternVisibility, applyVisibilityToNodes } from '@/mySky/applySkyNodeVisibility';
import { resolveCurrentSkyOwnerProfile } from '@/mySky/skyIdentity';
import { buildMySkyViewFromSources, resolveMySkySources } from '@/mySky/mySkyState';
import type { SkyConnectionActivity } from '@/mySky/skyConnectionSources';
import { EMPTY_SKY_EVOLUTION, type SkyEvolutionRecord } from '@/mySky/skyEvolution';
import type { MySkyVisibleLayers } from '@/mySky/skyLayers';
import {
  DEFAULT_SKY_VISIBILITY_SETTINGS,
  type SkyVisibilitySettings,
} from '@/mySky/skyVisibilitySettings';
import type { MySkyView } from '@/mySky/types';
import type { UserPersonalizationProfile } from '@/onboarding/personalization/types';

/** Build full My Sky view from personalization profile — includes skywrites + layer visibility. */
export function buildMySkyView(
  profile: UserPersonalizationProfile,
  visibleLayers?: MySkyVisibleLayers,
  evolution: SkyEvolutionRecord = EMPTY_SKY_EVOLUTION,
  connectionActivities: SkyConnectionActivity[] = [],
  participatingCommunityIds: string[] = [],
  visibilitySettings: SkyVisibilitySettings = DEFAULT_SKY_VISIBILITY_SETTINGS,
): MySkyView {
  const sources = resolveMySkySources(
    profile,
    evolution,
    connectionActivities,
    participatingCommunityIds,
  );
  sources.skyOwner = resolveCurrentSkyOwnerProfile(profile.northStar.originalVision);

  const view = buildMySkyViewFromSources(sources, visibleLayers);
  const nodes = applyVisibilityToNodes(view.nodes, visibilitySettings);
  const patterns = applyPatternVisibility(view.patterns, visibilitySettings);

  return {
    ...view,
    nodes,
    patterns,
    stars: view.stars.map((star) => {
      const node = nodes.find((entry) => entry.id === star.id);
      return node?.visibility ? { ...star, visibility: node.visibility } : star;
    }),
  };
}
