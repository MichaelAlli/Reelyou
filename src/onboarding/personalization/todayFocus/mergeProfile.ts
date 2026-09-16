import type { OnboardingState } from '@/onboarding/onboardingState';
import type { CommunitiesRecord } from '@/onboarding/personalization/communities/types';
import { EMPTY_COMMUNITIES } from '@/onboarding/personalization/communities/types';
import { normalizeOnboardingProfile } from '@/onboarding/personalization/normalizeProfile';
import type { TodayFocusRecord } from '@/onboarding/personalization/todayFocus/types';
import type { UserPersonalizationProfile } from '@/onboarding/personalization/types';
import type { AroundYourSkyState } from '@/social/aroundYourSky/types';
import { EMPTY_AROUND_YOUR_SKY } from '@/social/aroundYourSky/types';

/** Merge onboarding profile with local-first Home slices (focus, communities). */
export function mergePersonalizationProfile(
  state: OnboardingState,
  todayFocus: TodayFocusRecord,
  communities: CommunitiesRecord = EMPTY_COMMUNITIES,
  aroundYourSky: AroundYourSkyState = EMPTY_AROUND_YOUR_SKY,
): UserPersonalizationProfile {
  const base = normalizeOnboardingProfile(state);
  const hasFocus = Boolean(todayFocus.value && todayFocus.source);

  return {
    ...base,
    todayFocus: hasFocus
      ? {
          value: todayFocus.value!,
          source: todayFocus.source!,
          dateKey: todayFocus.dateKey,
          selectedAt: todayFocus.selectedAt,
          reflection: todayFocus.reflection,
          reflectionUpdatedAt: todayFocus.reflectionUpdatedAt,
        }
      : null,
    communities: {
      joined: [...communities.joined],
      explicitInterests: [...communities.explicitInterests],
    },
    aroundYourSky: {
      items: [...aroundYourSky.items],
    },
  };
}
