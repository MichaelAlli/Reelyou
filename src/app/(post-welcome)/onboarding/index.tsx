import { Redirect } from 'expo-router';

import { APPROVED_ONBOARDING_ENTRY_ROUTE } from '@/auth/resolveOnboardingRouting';
import { resolvePostLoginRoute } from '@/auth/resolvePostLoginRoute';
import { resolveServerOnboardingCompleteForRouting } from '@/auth/resolveServerOnboardingComplete';
import { useReelyouAuth } from '@/auth/ReelyouAuthProvider';
import { useOnboarding } from '@/onboarding';
import { useQaPreviewMode } from '@/qa/QaPreviewContext';
import { withQaPreviewHref } from '@/qa/qaPreviewRoutes';

/** /onboarding entry — redirects into the approved sequence (never the legacy intro). */
export default function OnboardingIndexRoute() {
  const auth = useReelyouAuth();
  const { state, userSessionHydrated, persistedOnboardingComplete } = useOnboarding();
  const qaPreview = useQaPreviewMode();

  if (qaPreview.active) {
    return <Redirect href={withQaPreviewHref(APPROVED_ONBOARDING_ENTRY_ROUTE) as never} />;
  }

  const serverComplete = resolveServerOnboardingCompleteForRouting(
    auth.user?.onboardingComplete,
    persistedOnboardingComplete,
  );
  const href = resolvePostLoginRoute(state, serverComplete, {
    authReady: auth.ready,
    isAuthenticated: auth.isAuthenticated,
    userSessionHydrated,
  });

  if (!href) {
    return null;
  }

  return <Redirect href={href as never} />;
}
