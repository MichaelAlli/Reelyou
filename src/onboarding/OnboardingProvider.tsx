import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

import {
  EMPTY_ONBOARDING_GOALS,
  EMPTY_ONBOARDING_PROFILE,
  MAX_ONBOARDING_GOALS,
  MAX_ONBOARDING_INTERESTS,
  type OnboardingGoalId,
  type OnboardingInterestId,
  type OnboardingProfileData,
} from '@/onboarding/types';

interface OnboardingContextValue {
  profile: OnboardingProfileData;
  goals: OnboardingGoalId[];
  setInterests: (interests: OnboardingInterestId[]) => void;
  toggleInterest: (interestId: OnboardingInterestId) => void;
  isInterestSelected: (interestId: OnboardingInterestId) => boolean;
  canSelectMoreInterests: boolean;
  setGoals: (goals: OnboardingGoalId[]) => void;
  toggleGoal: (goalId: OnboardingGoalId) => void;
  isGoalSelected: (goalId: OnboardingGoalId) => boolean;
  canSelectMoreGoals: boolean;
  resetProfile: () => void;
}

const OnboardingContext = createContext<OnboardingContextValue | null>(null);

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<OnboardingProfileData>(EMPTY_ONBOARDING_PROFILE);
  const [goals, setGoalsState] = useState<OnboardingGoalId[]>(EMPTY_ONBOARDING_GOALS);

  const setInterests = useCallback((interests: OnboardingInterestId[]) => {
    setProfile({ interests: interests.slice(0, MAX_ONBOARDING_INTERESTS) });
  }, []);

  const toggleInterest = useCallback((interestId: OnboardingInterestId) => {
    setProfile((current) => {
      const selected = current.interests.includes(interestId);
      if (selected) {
        return { interests: current.interests.filter((id) => id !== interestId) };
      }
      if (current.interests.length >= MAX_ONBOARDING_INTERESTS) {
        return current;
      }
      return { interests: [...current.interests, interestId] };
    });
  }, []);

  const isInterestSelected = useCallback(
    (interestId: OnboardingInterestId) => profile.interests.includes(interestId),
    [profile.interests],
  );

  const canSelectMoreInterests = profile.interests.length < MAX_ONBOARDING_INTERESTS;

  const setGoals = useCallback((nextGoals: OnboardingGoalId[]) => {
    setGoalsState(nextGoals.slice(0, MAX_ONBOARDING_GOALS));
  }, []);

  const toggleGoal = useCallback((goalId: OnboardingGoalId) => {
    setGoalsState((current) => {
      const selected = current.includes(goalId);
      if (selected) {
        return current.filter((id) => id !== goalId);
      }
      if (current.length >= MAX_ONBOARDING_GOALS) {
        return current;
      }
      return [...current, goalId];
    });
  }, []);

  const isGoalSelected = useCallback(
    (goalId: OnboardingGoalId) => goals.includes(goalId),
    [goals],
  );

  const canSelectMoreGoals = goals.length < MAX_ONBOARDING_GOALS;

  const resetProfile = useCallback(() => {
    setProfile(EMPTY_ONBOARDING_PROFILE);
    setGoalsState(EMPTY_ONBOARDING_GOALS);
  }, []);

  const value = useMemo(
    () => ({
      profile,
      goals,
      setInterests,
      toggleInterest,
      isInterestSelected,
      canSelectMoreInterests,
      setGoals,
      toggleGoal,
      isGoalSelected,
      canSelectMoreGoals,
      resetProfile,
    }),
    [
      profile,
      goals,
      setInterests,
      toggleInterest,
      isInterestSelected,
      canSelectMoreInterests,
      setGoals,
      toggleGoal,
      isGoalSelected,
      canSelectMoreGoals,
      resetProfile,
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
