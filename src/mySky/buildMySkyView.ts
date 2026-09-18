import { buildMySkyViewFromSources, resolveMySkySources } from '@/mySky/mySkyState';
import type { SkyConnectionActivity } from '@/mySky/skyConnectionSources';
import { EMPTY_SKY_EVOLUTION, type SkyEvolutionRecord } from '@/mySky/skyEvolution';
import type { MySkyVisibleLayers } from '@/mySky/skyLayers';
import type { MySkyView } from '@/mySky/types';
import type { UserPersonalizationProfile } from '@/onboarding/personalization/types';

/** Build full My Sky view from personalization profile — includes skywrites + layer visibility. */
export function buildMySkyView(
  profile: UserPersonalizationProfile,
  visibleLayers?: MySkyVisibleLayers,
  evolution: SkyEvolutionRecord = EMPTY_SKY_EVOLUTION,
  connectionActivities: SkyConnectionActivity[] = [],
  participatingCommunityIds: string[] = [],
): MySkyView {
  return buildMySkyViewFromSources(
    resolveMySkySources(
      profile,
      evolution,
      connectionActivities,
      participatingCommunityIds,
    ),
    visibleLayers,
  );
}
