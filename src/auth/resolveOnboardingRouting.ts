/** First approved onboarding step (Sign Up / login continue here). */
export const APPROVED_ONBOARDING_ENTRY_ROUTE = '/onboarding/profile';

/** Distinct routing gate — never treat unknown as incomplete. */
export type OnboardingRoutingStatus = 'loading' | 'complete' | 'incomplete';

export function resolveOnboardingRoutingStatus(input: {
  authReady: boolean;
  isAuthenticated: boolean;
  userSessionHydrated: boolean;
  serverOnboardingComplete?: boolean | null;
  localOnboardingComplete: boolean;
}): OnboardingRoutingStatus {
  if (!input.authReady || !input.isAuthenticated) return 'loading';
  if (!input.userSessionHydrated) return 'loading';

  if (input.serverOnboardingComplete === true || input.localOnboardingComplete) {
    return 'complete';
  }

  if (input.localOnboardingComplete) return 'complete';

  if (input.serverOnboardingComplete === false) return 'incomplete';

  return 'incomplete';
}

export function routeForOnboardingRoutingStatus(status: OnboardingRoutingStatus): string | null {
  if (status === 'loading') return null;
  if (status === 'complete') return '/(tabs)/home';
  return APPROVED_ONBOARDING_ENTRY_ROUTE;
}
