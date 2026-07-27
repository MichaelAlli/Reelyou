export const OnboardingGoalsCopy = {
  title: 'What are you hoping to achieve?',
  subtitle: 'Select up to 3 goals to shape your Starpath and personalize your experience.',
  purposeCallout:
    'Your purpose helps us curate the right people, content, and opportunities for your journey.',
  continue: 'CONTINUE',
  skip: "I'll do this later",
  validationSelectOne: 'Choose at least one goal to continue, or tap “I\'ll do this later”.',
  savedPlaceholder: 'Saved — the next onboarding step is coming soon.',
} as const;

export function formatGoalSelectionCount(selected: number, max: number): string {
  return `${selected} / ${max} selected`;
}
