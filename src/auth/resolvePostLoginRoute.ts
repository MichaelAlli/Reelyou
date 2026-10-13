import type { OnboardingState } from '@/onboarding/onboardingState';

import {
  resolveOnboardingRoutingStatus,
  routeForOnboardingRoutingStatus,
} from '@/auth/resolveOnboardingRouting';

/** Returning users land in the app; new accounts continue onboarding. Returns null while loading. */
export function resolvePostLoginRoute(
  onboarding: Pick<OnboardingState, 'isOnboardingComplete'>,
  /** true | false from server; null = unknown (do not treat as incomplete). */
  serverOnboardingComplete: boolean | null,
  options?: { userSessionHydrated?: boolean; authReady?: boolean; isAuthenticated?: boolean },
): string | null {
  const status = resolveOnboardingRoutingStatus({
    authReady: options?.authReady ?? true,
    isAuthenticated: options?.isAuthenticated ?? true,
    userSessionHydrated: options?.userSessionHydrated ?? true,
    serverOnboardingComplete,
    localOnboardingComplete: onboarding.isOnboardingComplete === true,
  });
  return routeForOnboardingRoutingStatus(status);
}
