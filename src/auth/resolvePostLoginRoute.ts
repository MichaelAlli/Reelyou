import type { OnboardingState } from '@/onboarding/onboardingState';

/** Returning users land in the app; new accounts continue onboarding. */
export function resolvePostLoginRoute(
  onboarding: Pick<OnboardingState, 'isOnboardingComplete' | 'steps'>,
  serverOnboardingComplete?: boolean | null,
): string {
  if (serverOnboardingComplete === true || onboarding.isOnboardingComplete) {
    return '/(tabs)/home';
  }
  const profileDone = onboarding.steps?.profile === 'completed';
  if (profileDone) {
    return '/(tabs)/home';
  }
  return '/onboarding/profile';
}
