import type { OnboardingGoalOption } from '@/onboarding/types';

export const ONBOARDING_GOAL_OPTIONS: OnboardingGoalOption[] = [
  { id: 'build-business', label: 'Build a Business', icon: 'rocket' },
  { id: 'advance-career', label: 'Advance My Career', icon: 'briefcase' },
  { id: 'build-relationships', label: 'Build Better Relationships', icon: 'heart' },
  { id: 'improve-mindset', label: 'Improve My Mindset', icon: 'brain' },
  { id: 'improve-health', label: 'Improve My Health', icon: 'dumbbell' },
  { id: 'strengthen-faith', label: 'Strengthen My Faith', icon: 'cross' },
  { id: 'financial-freedom', label: 'Achieve Financial Freedom', icon: 'dollarsign' },
  { id: 'learn-skills', label: 'Learn New Skills', icon: 'graduationcap' },
  { id: 'positive-impact', label: 'Make a Positive Impact', icon: 'globe' },
  { id: 'express-creativity', label: 'Express My Creativity', icon: 'palette' },
  { id: 'explore-world', label: 'Explore the World', icon: 'airplane' },
  { id: 'full-potential', label: 'Reach My Full Potential', icon: 'trophy' },
];

export const ONBOARDING_GOAL_ROWS: [OnboardingGoalOption, OnboardingGoalOption][] = [
  [ONBOARDING_GOAL_OPTIONS[0], ONBOARDING_GOAL_OPTIONS[1]],
  [ONBOARDING_GOAL_OPTIONS[2], ONBOARDING_GOAL_OPTIONS[3]],
  [ONBOARDING_GOAL_OPTIONS[4], ONBOARDING_GOAL_OPTIONS[5]],
  [ONBOARDING_GOAL_OPTIONS[6], ONBOARDING_GOAL_OPTIONS[7]],
  [ONBOARDING_GOAL_OPTIONS[8], ONBOARDING_GOAL_OPTIONS[9]],
  [ONBOARDING_GOAL_OPTIONS[10], ONBOARDING_GOAL_OPTIONS[11]],
];
