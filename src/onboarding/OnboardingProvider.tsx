import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

import {
  EMPTY_ONBOARDING_STATE,
  toLegacyProfileData,
  type OnboardingState,
  type OnboardingStepId,
  type OnboardingStepStatus,
} from '@/onboarding/onboardingState';
import {
  buildAiCompanionContext,
  buildHumanPotentialProfile,
  normalizeOnboardingProfile,
  type AiCompanionContext,
  type HumanPotentialProfile,
  type UserPersonalizationProfile,
} from '@/onboarding/personalization';
import { MAX_NORTH_STAR_VISION_LENGTH } from '@/onboarding/northStar';
import {
  MAX_ONBOARDING_CHALLENGES,
  MAX_ONBOARDING_GOALS,
  MAX_ONBOARDING_INTERESTS,
  type OnboardingChallengeId,
  type OnboardingGoalId,
  type OnboardingInterestId,
  type OnboardingProfileData,
} from '@/onboarding/types';

interface OnboardingContextValue {
  /** Unified onboarding state — single source of truth for all screens */
  state: OnboardingState;
  /** Normalized User Personalization Profile (derived, backend-ready) */
  personalizationProfile: UserPersonalizationProfile;
  /** AI Context Builder output — future AI Companion reads ONLY from personalizationProfile */
  aiContext: AiCompanionContext;
  /** Human Potential Profile — Starpath-ready aggregate including NorthStar.originalVision */
  humanPotentialProfile: HumanPotentialProfile;
  /** @deprecated Use state.interests — kept for Screen 1 compatibility */
  profile: OnboardingProfileData;
  /** @deprecated Use state.goals */
  goals: OnboardingGoalId[];
  /** Screen 3 challenges */
  challenges: OnboardingChallengeId[];
  /** Screen 4 North Star — verbatim vision text */
  northStar: OnboardingState['northStar'];
  setInterests: (interests: OnboardingInterestId[]) => void;
  toggleInterest: (interestId: OnboardingInterestId) => void;
  isInterestSelected: (interestId: OnboardingInterestId) => boolean;
  canSelectMoreInterests: boolean;
  setGoals: (goals: OnboardingGoalId[]) => void;
  toggleGoal: (goalId: OnboardingGoalId) => void;
  isGoalSelected: (goalId: OnboardingGoalId) => boolean;
  canSelectMoreGoals: boolean;
  setChallenges: (challenges: OnboardingChallengeId[]) => void;
  toggleChallenge: (challengeId: OnboardingChallengeId) => void;
  isChallengeSelected: (challengeId: OnboardingChallengeId) => boolean;
  canSelectMoreChallenges: boolean;
  setNorthStarVision: (vision: string) => void;
  markStep: (step: OnboardingStepId, status: OnboardingStepStatus) => void;
  setAiPersonalizationEnabled: (enabled: boolean) => void;
  /** Restart onboarding — clears all answers and step progress */
  resetOnboarding: () => void;
  /** @deprecated Alias for resetOnboarding */
  resetProfile: () => void;
  /** Clear personalization data while preserving AI toggle preference */
  clearPersonalizationData: () => void;
  /** Mark onboarding flow complete (Process Screen) — preserves all collected data */
  completeOnboarding: () => void;
}

const OnboardingContext = createContext<OnboardingContextValue | null>(null);

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<OnboardingState>(EMPTY_ONBOARDING_STATE);

  const personalizationProfile = useMemo(() => normalizeOnboardingProfile(state), [state]);
  const humanPotentialProfile = useMemo(() => buildHumanPotentialProfile(state), [state]);
  const aiContext = useMemo(
    () => buildAiCompanionContext(personalizationProfile),
    [personalizationProfile],
  );

  const profile = useMemo(() => toLegacyProfileData(state), [state.interests]);
  const goals = state.goals;
  const challenges = state.challenges;
  const northStar = state.northStar;

  const setInterests = useCallback((interests: OnboardingInterestId[]) => {
    setState((current) => ({
      ...current,
      interests: interests.slice(0, MAX_ONBOARDING_INTERESTS),
    }));
  }, []);

  const toggleInterest = useCallback((interestId: OnboardingInterestId) => {
    setState((current) => {
      const selected = current.interests.includes(interestId);
      if (selected) {
        return { ...current, interests: current.interests.filter((id) => id !== interestId) };
      }
      if (current.interests.length >= MAX_ONBOARDING_INTERESTS) {
        return current;
      }
      return { ...current, interests: [...current.interests, interestId] };
    });
  }, []);

  const isInterestSelected = useCallback(
    (interestId: OnboardingInterestId) => state.interests.includes(interestId),
    [state.interests],
  );

  const canSelectMoreInterests = state.interests.length < MAX_ONBOARDING_INTERESTS;

  const setGoals = useCallback((nextGoals: OnboardingGoalId[]) => {
    setState((current) => ({
      ...current,
      goals: nextGoals.slice(0, MAX_ONBOARDING_GOALS),
    }));
  }, []);

  const toggleGoal = useCallback((goalId: OnboardingGoalId) => {
    setState((current) => {
      const selected = current.goals.includes(goalId);
      if (selected) {
        return { ...current, goals: current.goals.filter((id) => id !== goalId) };
      }
      if (current.goals.length >= MAX_ONBOARDING_GOALS) {
        return current;
      }
      return { ...current, goals: [...current.goals, goalId] };
    });
  }, []);

  const isGoalSelected = useCallback(
    (goalId: OnboardingGoalId) => state.goals.includes(goalId),
    [state.goals],
  );

  const canSelectMoreGoals = state.goals.length < MAX_ONBOARDING_GOALS;

  const setChallenges = useCallback((nextChallenges: OnboardingChallengeId[]) => {
    setState((current) => ({
      ...current,
      challenges: nextChallenges.slice(0, MAX_ONBOARDING_CHALLENGES),
    }));
  }, []);

  const toggleChallenge = useCallback((challengeId: OnboardingChallengeId) => {
    setState((current) => {
      const selected = current.challenges.includes(challengeId);
      if (selected) {
        return {
          ...current,
          challenges: current.challenges.filter((id) => id !== challengeId),
        };
      }
      if (current.challenges.length >= MAX_ONBOARDING_CHALLENGES) {
        return current;
      }
      return { ...current, challenges: [...current.challenges, challengeId] };
    });
  }, []);

  const isChallengeSelected = useCallback(
    (challengeId: OnboardingChallengeId) => state.challenges.includes(challengeId),
    [state.challenges],
  );

  const canSelectMoreChallenges = state.challenges.length < MAX_ONBOARDING_CHALLENGES;

  const setNorthStarVision = useCallback((vision: string) => {
    setState((current) => ({
      ...current,
      northStar: { originalVision: vision.slice(0, MAX_NORTH_STAR_VISION_LENGTH) },
    }));
  }, []);

  const markStep = useCallback((step: OnboardingStepId, status: OnboardingStepStatus) => {
    setState((current) => ({
      ...current,
      steps: { ...current.steps, [step]: status },
    }));
  }, []);

  const setAiPersonalizationEnabled = useCallback((enabled: boolean) => {
    setState((current) => ({ ...current, aiPersonalizationEnabled: enabled }));
  }, []);

  const resetOnboarding = useCallback(() => {
    setState(EMPTY_ONBOARDING_STATE);
  }, []);

  const clearPersonalizationData = useCallback(() => {
    setState((current) => ({
      ...EMPTY_ONBOARDING_STATE,
      aiPersonalizationEnabled: current.aiPersonalizationEnabled,
    }));
  }, []);

  const completeOnboarding = useCallback(() => {
    setState((current) => ({
      ...current,
      isOnboardingComplete: true,
    }));
  }, []);

  const value = useMemo(
    () => ({
      state,
      personalizationProfile,
      humanPotentialProfile,
      aiContext,
      profile,
      goals,
      challenges,
      northStar,
      setInterests,
      toggleInterest,
      isInterestSelected,
      canSelectMoreInterests,
      setGoals,
      toggleGoal,
      isGoalSelected,
      canSelectMoreGoals,
      setChallenges,
      toggleChallenge,
      isChallengeSelected,
      canSelectMoreChallenges,
      setNorthStarVision,
      markStep,
      setAiPersonalizationEnabled,
      resetOnboarding,
      resetProfile: resetOnboarding,
      clearPersonalizationData,
      completeOnboarding,
    }),
    [
      state,
      personalizationProfile,
      humanPotentialProfile,
      aiContext,
      profile,
      goals,
      challenges,
      northStar,
      setInterests,
      toggleInterest,
      isInterestSelected,
      canSelectMoreInterests,
      setGoals,
      toggleGoal,
      isGoalSelected,
      canSelectMoreGoals,
      setChallenges,
      toggleChallenge,
      isChallengeSelected,
      canSelectMoreChallenges,
      setNorthStarVision,
      markStep,
      setAiPersonalizationEnabled,
      resetOnboarding,
      clearPersonalizationData,
      completeOnboarding,
    ],
  );

  return <OnboardingContext.Provider value={value}>{children}</OnboardingContext.Provider>;
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding must be used within OnboardingProvider');
  }
  return context;
}
