import type { OnboardingChallengeId, OnboardingGoalId, OnboardingInterestId } from '@/onboarding/types';
import type { NorthStarData } from '@/onboarding/northStar';
import { EMPTY_NORTH_STAR } from '@/onboarding/northStar';

/** Lifecycle status for each onboarding step. */
export type OnboardingStepStatus = 'pending' | 'completed' | 'skipped';

export type OnboardingStepId = 'profile' | 'goals' | 'challenges' | 'screen4';

/**
 * Unified onboarding state — single source of truth for all onboarding screens.
 * Future screens append fields here and register a step in `steps`.
 */
export interface OnboardingState {
  /** Screen 1 — interests */
  interests: OnboardingInterestId[];
  /** Screen 2 — goals */
  goals: OnboardingGoalId[];
  /** Screen 3 — challenges */
  challenges: OnboardingChallengeId[];
  /** Screen 4 — North Star vision (verbatim) */
  northStar: NorthStarData;
  /** Per-step completion tracking */
  steps: Record<OnboardingStepId, OnboardingStepStatus>;
  /** User control over AI personalization */
  aiPersonalizationEnabled: boolean;
  /** Set true when Process Screen finishes — onboarding flow complete */
  isOnboardingComplete: boolean;
}

export const EMPTY_ONBOARDING_STATE: OnboardingState = {
  interests: [],
  goals: [],
  challenges: [],
  northStar: EMPTY_NORTH_STAR,
  steps: {
    profile: 'pending',
    goals: 'pending',
    challenges: 'pending',
    screen4: 'pending',
  },
  aiPersonalizationEnabled: true,
  isOnboardingComplete: false,
};

/** Maps legacy Screen 1 profile shape for backward-compatible consumers. */
export function toLegacyProfileData(state: OnboardingState) {
  return { interests: state.interests };
}
