import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';

import { mapAuthErrorToMessage } from '@/auth/authErrorMessages';
import { resolvePostLoginRoute } from '@/auth/resolvePostLoginRoute';
import { useReelyouAuth } from '@/auth/ReelyouAuthProvider';
import { loadRememberMePreference } from '@/auth/reellyouAuthPersistence';
import { useLogInForm } from '@/hooks/use-log-in-form';
import { useOnboarding } from '@/onboarding';
import { useQaPreviewMode } from '@/qa/QaPreviewContext';
import { isLogInFormValid } from '@/utils/logInValidation';

export function useReelyouSignIn() {
  const router = useRouter();
  const auth = useReelyouAuth();
  const { state: onboardingState, userSessionHydrated } = useOnboarding();
  const qaPreview = useQaPreviewMode();
  const form = useLogInForm();
  const [authError, setAuthError] = useState<string | null>(null);
  const [restoringSession, setRestoringSession] = useState(auth.configured && !auth.ready);

  useEffect(() => {
    if (!auth.configured) {
      setRestoringSession(false);
      return;
    }
    if (auth.ready) {
      setRestoringSession(false);
      if (auth.isAuthenticated && userSessionHydrated && !qaPreview.active) {
        const route = resolvePostLoginRoute(onboardingState, auth.user?.onboardingComplete ?? null, {
          userSessionHydrated,
          authReady: auth.ready,
          isAuthenticated: auth.isAuthenticated,
        });
        if (route) router.replace(route as never);
      }
      return;
    }
    setRestoringSession(true);
  }, [
    auth.configured,
    auth.isAuthenticated,
    auth.ready,
    auth.user?.onboardingComplete,
    onboardingState,
    router,
    userSessionHydrated,
    qaPreview.active,
  ]);

  useEffect(() => {
    void loadRememberMePreference().then((remember) => {
      if (remember) form.updateField('rememberMe', true);
    });
  }, [form.updateField]);

  const signIn = useCallback(async () => {
    form.markTouched('email');
    form.markTouched('password');
    if (!isLogInFormValid(form.values)) return;

    if (!auth.configured) {
      return;
    }
    setAuthError(null);
    form.setSubmitting(true);
    const result = await auth.login({
      email: form.values.email.trim(),
      password: form.values.password,
      rememberMe: form.values.rememberMe,
    });
    form.setSubmitting(false);
    if (!result.ok) {
      setAuthError(mapAuthErrorToMessage(result.error));
    }
  }, [auth, form]);

  const goToForgotPassword = useCallback(() => {
    router.push('/forgot-password' as never);
  }, [router]);

  return {
    ...form,
    authError,
    signIn,
    goToForgotPassword,
    restoringSession,
    authConfigured: auth.configured,
  };
}
