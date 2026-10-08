import { useRouter, useSegments } from 'expo-router';
import { useEffect, type ReactNode } from 'react';

import { isReelyouAuthConfigured } from '@/auth/reellyouAuthConfig';
import { useReelyouAuth } from '@/auth/ReelyouAuthProvider';
import { isQaPreviewGalleryAllowed } from '@/config/qaPreviewFlags';

const PUBLIC_ROUTE_NAMES = new Set([
  'login',
  'signup',
  'sign-up',
  'forgot-password',
  'reset-password',
]);

function isPublicPostWelcomeRoute(segments: readonly string[]): boolean {
  const leaf = segments[segments.length - 1] ?? '';
  if (PUBLIC_ROUTE_NAMES.has(leaf)) return true;
  return segments.some((segment) => segment === 'legal' || segment.startsWith('legal'));
}

function isInternalQaGalleryRoute(segments: readonly string[]): boolean {
  return segments.some((segment) => segment === 'qa');
}

/**
 * When server auth is enabled, post-welcome app routes require a real session.
 * Auth entry screens remain reachable while signed out.
 */
export function PostWelcomeAuthGuard({ children }: { children: ReactNode }) {
  const auth = useReelyouAuth();
  const router = useRouter();
  const segments = useSegments();

  const qaGalleryRoute =
    isInternalQaGalleryRoute(segments) && isQaPreviewGalleryAllowed(auth.user?.email ?? null);

  useEffect(() => {
    if (!isReelyouAuthConfigured()) return;
    if (!auth.ready) return;
    if (auth.isAuthenticated) return;
    if (isPublicPostWelcomeRoute(segments)) return;
    if (qaGalleryRoute) return;
    router.replace('/welcome' as never);
  }, [auth.isAuthenticated, auth.ready, qaGalleryRoute, router, segments]);

  if (isReelyouAuthConfigured() && auth.ready && !auth.isAuthenticated) {
    if (!isPublicPostWelcomeRoute(segments) && !qaGalleryRoute) {
      return null;
    }
  }

  return children;
}
