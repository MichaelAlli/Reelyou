import type { OnboardingState } from '@/onboarding/onboardingState';
import { normalizeOnboardingProfile } from '@/onboarding/personalization/normalizeProfile';
import {
  EMPTY_HUMAN_POTENTIAL_PROFILE,
  type HumanPotentialProfile,
} from '@/onboarding/personalization/humanPotentialProfile';

/**
 * Builds the Human Potential Profile from unified onboarding state.
 * Preserves NorthStar.originalVision exactly as entered.
 */
export function buildHumanPotentialProfile(state: OnboardingState): HumanPotentialProfile {
  const personalization = normalizeOnboardingProfile(state);

  const hasData =
    state.northStar.originalVision.length > 0 ||
    personalization.interests.length > 0 ||
    personalization.goals.length > 0 ||
    personalization.challenges.length > 0;

  return {
    NorthStar: { originalVision: state.northStar.originalVision },
    personalization: {
      interests: personalization.interests,
      goals: personalization.goals,
      challenges: personalization.challenges,
      aspirations: personalization.aspirations,
      growthPriorities: personalization.growthPriorities,
    },
    onboarding: personalization.onboarding,
    aiPersonalizationEnabled: personalization.aiPersonalizationEnabled,
    lastUpdatedAt: hasData ? new Date().toISOString() : null,
  };
}
