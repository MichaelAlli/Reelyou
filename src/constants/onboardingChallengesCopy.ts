export const OnboardingChallengesCopy = {
  title: 'What challenges are you facing?',
  subtitle:
    'Select up to 5 challenges. This helps us personalize your Starpath and support your growth journey.',
  purposeCallout:
    "Your challenges don't define you. They help us understand where you're starting so we can help guide where you're going.",
  continue: 'CONTINUE',
  skip: "I'll do this later",
  validationSelectOne: 'Choose at least one challenge to continue, or tap “I\'ll do this later”.',
  savedPlaceholder: 'Saved — the next onboarding step is coming soon.',
} as const;

export function formatChallengeSelectionCount(selected: number, max: number): string {
  return `${selected} / ${max} selected`;
}
