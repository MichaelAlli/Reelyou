import type { OnboardingState } from '@/onboarding/onboardingState';
import { normalizeOnboardingProfile } from '@/onboarding/personalization/normalizeProfile';
import type { TodayFocusRecord } from '@/onboarding/personalization/todayFocus/types';
import type { UserPersonalizationProfile } from '@/onboarding/personalization/types';

/** Merge onboarding profile with the active daily focus + reflection slice. */
export function mergePersonalizationProfile(
  state: OnboardingState,
  todayFocus: TodayFocusRecord,
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
  };
}
