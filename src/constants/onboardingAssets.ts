/**
 * Onboarding background assets.
 * onboarding-profile-background.png: ONBOARDING SCREEN 1 BACKGROUND artwork.
 * onboarding-screen-2-background.png: ONBOARDING SCREEN 2 BACKGROUND artwork.
 */
export const OnboardingAssets = {
  profileBackground: require('../assets/backgrounds/onboarding/onboarding-profile-background.png'),
  screen2Background: require('../assets/backgrounds/onboarding/onboarding-screen-2-background.png'),
} as const;

export type OnboardingBackgroundKey = keyof typeof OnboardingAssets;
