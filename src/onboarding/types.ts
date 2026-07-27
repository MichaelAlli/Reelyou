/** Interest option identifiers for onboarding screen 1. */
export type OnboardingInterestId =
  | 'entrepreneurship'
  | 'personal-development'
  | 'relationships'
  | 'creativity'
  | 'travel'
  | 'leadership'
  | 'mental-health'
  | 'career-growth'
  | 'fitness-wellness'
  | 'faith-spirituality'
  | 'technology'
  | 'financial-freedom'
  | 'education'
  | 'community-impact';

export interface OnboardingInterestOption {
  id: OnboardingInterestId;
  label: string;
  icon: OnboardingInterestIconName;
}

export type OnboardingInterestIconName =
  | 'star'
  | 'leaf'
  | 'heart'
  | 'sparkles'
  | 'airplane'
  | 'person'
  | 'brain'
  | 'briefcase'
  | 'dumbbell'
  | 'cross'
  | 'desktop'
  | 'dollarsign'
  | 'graduationcap'
  | 'bubble';

/** Data collected on onboarding screen 1 — interests only. */
export interface OnboardingProfileData {
  interests: OnboardingInterestId[];
}

export const MAX_ONBOARDING_INTERESTS = 5;

export const EMPTY_ONBOARDING_PROFILE: OnboardingProfileData = {
  interests: [],
};
