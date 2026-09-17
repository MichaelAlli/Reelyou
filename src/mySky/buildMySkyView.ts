import { buildMySkyViewFromSources, resolveMySkySources } from '@/mySky/mySkyState';
import type { MySkyView } from '@/mySky/types';
import type { UserPersonalizationProfile } from '@/onboarding/personalization/types';

/** Build full My Sky view from personalization profile — includes skywrites. */
export function buildMySkyView(profile: UserPersonalizationProfile): MySkyView {
  return buildMySkyViewFromSources(resolveMySkySources(profile));
}
