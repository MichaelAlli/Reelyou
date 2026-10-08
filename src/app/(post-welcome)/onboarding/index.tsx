import { Redirect } from 'expo-router';

import { resolvePostLoginRoute } from '@/auth/resolvePostLoginRoute';
import { useReelyouAuth } from '@/auth/ReelyouAuthProvider';
import { useOnboarding } from '@/onboarding';

/** /onboarding entry — redirects into the approved sequence (never the legacy intro). */
export default function OnboardingIndexRoute() {
  const auth = useReelyouAuth();
  const { state, userSessionHydrated } = useOnboarding();

  const href = resolvePostLoginRoute(state, auth.user?.onboardingComplete ?? null, {
    authReady: auth.ready,
    isAuthenticated: auth.isAuthenticated,
    userSessionHydrated,
  });

  if (!href) {
    return null;
  }

  return <Redirect href={href as never} />;
}
