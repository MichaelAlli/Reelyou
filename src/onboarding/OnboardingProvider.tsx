import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

import {
  EMPTY_ONBOARDING_PROFILE,
  MAX_ONBOARDING_INTERESTS,
  type OnboardingInterestId,
  type OnboardingProfileData,
} from '@/onboarding/types';

interface OnboardingContextValue {
  profile: OnboardingProfileData;
  setInterests: (interests: OnboardingInterestId[]) => void;
  toggleInterest: (interestId: OnboardingInterestId) => void;
  isInterestSelected: (interestId: OnboardingInterestId) => boolean;
  canSelectMore: boolean;
  resetProfile: () => void;
}

const OnboardingContext = createContext<OnboardingContextValue | null>(null);

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<OnboardingProfileData>(EMPTY_ONBOARDING_PROFILE);

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

  const canSelectMore = profile.interests.length < MAX_ONBOARDING_INTERESTS;

  const resetProfile = useCallback(() => {
    setProfile(EMPTY_ONBOARDING_PROFILE);
  }, []);

  const value = useMemo(
    () => ({
      profile,
      setInterests,
      toggleInterest,
      isInterestSelected,
      canSelectMore,
      resetProfile,
    }),
    [profile, setInterests, toggleInterest, isInterestSelected, canSelectMore, resetProfile],
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
