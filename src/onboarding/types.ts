/** Goal option identifiers for onboarding screen 2. */
export type OnboardingGoalId =
  | 'build-business'
  | 'build-relationships'
  | 'improve-health'
  | 'financial-freedom'
  | 'positive-impact'
  | 'explore-world'
  | 'advance-career'
  | 'improve-mindset'
  | 'strengthen-faith'
  | 'learn-skills'
  | 'express-creativity'
  | 'full-potential';

export type OnboardingGoalIconName =
  | 'rocket'
  | 'heart'
  | 'dumbbell'
  | 'dollarsign'
  | 'globe'
  | 'airplane'
  | 'briefcase'
  | 'brain'
  | 'cross'
  | 'graduationcap'
  | 'palette'
  | 'trophy';

export interface OnboardingGoalOption {
  id: OnboardingGoalId;
  label: string;
  icon: OnboardingGoalIconName;
}

/** Data collected on onboarding screen 1 — interests only. */
export interface OnboardingProfileData {
  interests: OnboardingInterestId[];
}

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

export const MAX_ONBOARDING_INTERESTS = 5;
export const MAX_ONBOARDING_GOALS = 3;

export const EMPTY_ONBOARDING_PROFILE: OnboardingProfileData = {
  interests: [],
};

export const EMPTY_ONBOARDING_GOALS: OnboardingGoalId[] = [];
