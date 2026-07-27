import type { OnboardingInterestOption } from '@/onboarding/types';

/** Order matches the attached UI reference — left column, then right column, row by row. */
export const ONBOARDING_INTEREST_OPTIONS: OnboardingInterestOption[] = [
  { id: 'entrepreneurship', label: 'Entrepreneurship', icon: 'star' },
  { id: 'career-growth', label: 'Career Growth', icon: 'briefcase' },
  { id: 'personal-development', label: 'Personal Development', icon: 'leaf' },
  { id: 'fitness-wellness', label: 'Fitness & Wellness', icon: 'dumbbell' },
  { id: 'relationships', label: 'Relationships', icon: 'heart' },
  { id: 'faith-spirituality', label: 'Faith & Spirituality', icon: 'cross' },
  { id: 'creativity', label: 'Creativity', icon: 'sparkles' },
  { id: 'technology', label: 'Technology', icon: 'desktop' },
  { id: 'travel', label: 'Travel', icon: 'airplane' },
  { id: 'financial-freedom', label: 'Financial Freedom', icon: 'dollarsign' },
  { id: 'leadership', label: 'Leadership', icon: 'person' },
  { id: 'education', label: 'Education', icon: 'graduationcap' },
  { id: 'mental-health', label: 'Mental Health', icon: 'brain' },
  { id: 'community-impact', label: 'Community Impact', icon: 'bubble' },
];

/** Pairs for two-column grid layout matching the reference. */
export const ONBOARDING_INTEREST_ROWS: [OnboardingInterestOption, OnboardingInterestOption][] = [
  [ONBOARDING_INTEREST_OPTIONS[0], ONBOARDING_INTEREST_OPTIONS[1]],
  [ONBOARDING_INTEREST_OPTIONS[2], ONBOARDING_INTEREST_OPTIONS[3]],
  [ONBOARDING_INTEREST_OPTIONS[4], ONBOARDING_INTEREST_OPTIONS[5]],
  [ONBOARDING_INTEREST_OPTIONS[6], ONBOARDING_INTEREST_OPTIONS[7]],
  [ONBOARDING_INTEREST_OPTIONS[8], ONBOARDING_INTEREST_OPTIONS[9]],
  [ONBOARDING_INTEREST_OPTIONS[10], ONBOARDING_INTEREST_OPTIONS[11]],
  [ONBOARDING_INTEREST_OPTIONS[12], ONBOARDING_INTEREST_OPTIONS[13]],
];
