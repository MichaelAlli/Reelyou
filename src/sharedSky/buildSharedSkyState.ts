import { buildMySkyView } from '@/mySky/buildMySkyView';
import { buildMySkyGraph, resolveMySkySources } from '@/mySky/mySkyState';
import { resolveCurrentSkyOwnerProfile } from '@/mySky/skyIdentity';
import type { MySkyVisibleLayers } from '@/mySky/skyLayers';
import type { SkyEvolutionRecord } from '@/mySky/skyEvolution';
import type { SkyConnectionActivity } from '@/mySky/skyConnectionSources';
import type { SkyVisibilitySettings } from '@/mySky/skyVisibilitySettings';
import type { UserPersonalizationProfile } from '@/onboarding/personalization/types';

import type { SharedSkyState } from '@/sharedSky/sharedSkyTypes';

/** Build canonical shared Sky from the same inputs My Sky uses — no parallel store. */
export function buildSharedSkyState(
  profile: UserPersonalizationProfile,
  visibleLayers: MySkyVisibleLayers | undefined,
  evolution: SkyEvolutionRecord,
  connectionActivities: SkyConnectionActivity[],
  participatingCommunityIds: string[],
  visibilitySettings: SkyVisibilitySettings,
): SharedSkyState {
  const expandedView = buildMySkyView(
    profile,
    visibleLayers,
    evolution,
    connectionActivities,
    participatingCommunityIds,
    visibilitySettings,
  );

  const sources = resolveMySkySources(
    profile,
    evolution,
    connectionActivities,
    participatingCommunityIds,
  );
  sources.skyOwner = resolveCurrentSkyOwnerProfile(profile.northStar.originalVision);

  const graph = buildMySkyGraph(sources);

  return {
    sources,
    graph,
    expandedView,
    patterns: expandedView.patterns,
    builtAt: graph.builtAt,
  };
}
