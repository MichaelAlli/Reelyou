import type { OnboardingChallengeOption } from '@/onboarding/types';

/** Order matches the attached Screen 3 UI reference — left column, then right, row by row. */
export const ONBOARDING_CHALLENGE_OPTIONS: OnboardingChallengeOption[] = [
  { id: 'lack-of-motivation', label: 'Lack of Motivation', icon: 'brain' },
  { id: 'career-uncertainty', label: 'Career Uncertainty', icon: 'briefcase' },
  { id: 'finding-purpose', label: 'Finding My Purpose', icon: 'star' },
  { id: 'starting-business', label: 'Starting a Business', icon: 'rocket' },
  { id: 'building-confidence', label: 'Building Confidence', icon: 'shield' },
  { id: 'mental-wellness', label: 'Mental Wellness', icon: 'lotus' },
  { id: 'financial-stress', label: 'Financial Stress', icon: 'dollarsign' },
  { id: 'building-discipline', label: 'Building Discipline', icon: 'target' },
  { id: 'relationship-challenges', label: 'Relationship Challenges', icon: 'heart' },
  { id: 'spiritual-growth', label: 'Spiritual Growth', icon: 'leaf' },
  { id: 'time-management', label: 'Time Management', icon: 'clock' },
  { id: 'finding-community', label: 'Finding Community', icon: 'people' },
  { id: 'fear-of-future', label: 'Fear of Future', icon: 'warning' },
  { id: 'work-life-balance', label: 'Work Life Balance', icon: 'scale' },
];

export const ONBOARDING_CHALLENGE_ROWS: [OnboardingChallengeOption, OnboardingChallengeOption][] = [
  [ONBOARDING_CHALLENGE_OPTIONS[0], ONBOARDING_CHALLENGE_OPTIONS[1]],
  [ONBOARDING_CHALLENGE_OPTIONS[2], ONBOARDING_CHALLENGE_OPTIONS[3]],
  [ONBOARDING_CHALLENGE_OPTIONS[4], ONBOARDING_CHALLENGE_OPTIONS[5]],
  [ONBOARDING_CHALLENGE_OPTIONS[6], ONBOARDING_CHALLENGE_OPTIONS[7]],
  [ONBOARDING_CHALLENGE_OPTIONS[8], ONBOARDING_CHALLENGE_OPTIONS[9]],
  [ONBOARDING_CHALLENGE_OPTIONS[10], ONBOARDING_CHALLENGE_OPTIONS[11]],
  [ONBOARDING_CHALLENGE_OPTIONS[12], ONBOARDING_CHALLENGE_OPTIONS[13]],
];
