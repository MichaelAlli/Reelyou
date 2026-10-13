/**
 * Tri-state onboarding completion from server (true / false / unknown).
 * Unknown means profile + onboarding snapshot could not be loaded — never treat as incomplete.
 */
export function resolveServerOnboardingCompleteForRouting(
  authUserComplete: boolean | undefined,
  persistedFromHydration: boolean | null,
): boolean | null {
  if (persistedFromHydration === true || authUserComplete === true) return true;
  if (persistedFromHydration === false) return false;
  if (authUserComplete === false) return false;
  return null;
}

export function persistedOnboardingCompleteFromFetches(input: {
  serverProfileComplete?: boolean;
  remoteOnboardingComplete?: boolean;
  serverProfileLoaded: boolean;
  remoteOnboardingLoaded: boolean;
}): boolean | null {
  if (!input.serverProfileLoaded && !input.remoteOnboardingLoaded) return null;
  return (
    input.serverProfileComplete === true || input.remoteOnboardingComplete === true
  );
}
