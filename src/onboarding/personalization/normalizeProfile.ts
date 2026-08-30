import { ONBOARDING_CHALLENGE_OPTIONS } from '@/constants/onboardingChallenges';
import { ONBOARDING_GOAL_OPTIONS } from '@/constants/onboardingGoals';
import { ONBOARDING_INTEREST_OPTIONS } from '@/constants/onboardingInterests';
import type { OnboardingState, OnboardingStepId } from '@/onboarding/onboardingState';
import {
  EMPTY_PERSONALIZATION_PROFILE,
  type UserPersonalizationProfile,
} from '@/onboarding/personalization/types';

const STEP_LABELS: Record<OnboardingStepId, string> = {
  profile: 'interests',
  goals: 'goals',
  challenges: 'challenges',
  screen4: 'northStar',
};

function labelForInterest(id: string): string | undefined {
  return ONBOARDING_INTEREST_OPTIONS.find((o) => o.id === id)?.label;
}

function labelForGoal(id: string): string | undefined {
  return ONBOARDING_GOAL_OPTIONS.find((o) => o.id === id)?.label;
}

function labelForChallenge(id: string): string | undefined {
  return ONBOARDING_CHALLENGE_OPTIONS.find((o) => o.id === id)?.label;
}

/**
 * Profile Normalization Engine — merges unified onboarding state into one
 * backend-ready User Personalization Profile. No inference beyond explicit selections.
 */
export function normalizeOnboardingProfile(state: OnboardingState): UserPersonalizationProfile {
  const interests = state.interests
    .map(labelForInterest)
    .filter((label): label is string => Boolean(label));
  const goals = state.goals.map(labelForGoal).filter((label): label is string => Boolean(label));
  const challenges = state.challenges
    .map(labelForChallenge)
    .filter((label): label is string => Boolean(label));

  const stepsCompleted = (Object.entries(state.steps) as [OnboardingStepId, string][]).filter(
    ([, status]) => status === 'completed',
  ).map(([step]) => STEP_LABELS[step]);

  const stepsSkipped = (Object.entries(state.steps) as [OnboardingStepId, string][]).filter(
    ([, status]) => status === 'skipped',
  ).map(([step]) => STEP_LABELS[step]);

  const totalSteps = Object.keys(state.steps).length;
  const resolvedSteps = stepsCompleted.length + stepsSkipped.length;

  const hasAnyData =
    interests.length > 0 ||
    goals.length > 0 ||
    challenges.length > 0 ||
    state.northStar.originalVision.length > 0 ||
    resolvedSteps > 0;

  return {
    ...EMPTY_PERSONALIZATION_PROFILE,
    interests,
    goals,
    challenges,
    aspirations: [...goals],
    growthPriorities: [...new Set([...goals, ...challenges])],
    northStar: { originalVision: state.northStar.originalVision },
    onboarding: {
      stepsCompleted,
      stepsSkipped,
      isComplete: state.isOnboardingComplete || resolvedSteps === totalSteps,
      completionPercent: state.isOnboardingComplete
        ? 100
        : totalSteps > 0
          ? Math.round((resolvedSteps / totalSteps) * 100)
          : 0,
    },
    aiPersonalizationEnabled: state.aiPersonalizationEnabled,
    lastUpdatedAt: hasAnyData ? new Date().toISOString() : null,
  };
}
