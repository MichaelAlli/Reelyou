export const OnboardingNorthStarCopy = {
  promptLine1: 'Imagine 5 years from now...',
  promptLine2: 'what does it look like?',
  promptLine3: 'What would make you proud?',
  inputPlaceholder: 'Start writing your vision...',
  createStarpath: 'CREATE MY STARPATH',
  skip: "I'll do this later",
  validationRequired: 'Write your North Star vision to continue, or tap “I\'ll do this later”.',
  savedPlaceholder: 'Saved — the next onboarding step is coming soon.',
} as const;

export function formatNorthStarCharacterCount(current: number, max: number): string {
  return `${current} / ${max}`;
}
