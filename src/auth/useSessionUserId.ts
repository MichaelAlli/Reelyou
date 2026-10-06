import { useMemo } from 'react';

import { isExplicitDevDemoModeEnabled, isRealAuthBetaPath } from '@/auth/demoMode';
import { useReelyouAuth } from '@/auth/ReelyouAuthProvider';
import { resolveSessionUserId } from '@/auth/resolveSessionUserId';
import { currentUser } from '@/data/mockData';

/** Canonical signed-in user id for Beta — null when auth is required but session is missing. */
export function useSessionUserId(): {
  userId: string | null;
  displayName: string;
  email: string | null;
  isAuthenticated: boolean;
  authReady: boolean;
} {
  const auth = useReelyouAuth();
  const userId = useMemo(() => resolveSessionUserId(auth.user), [auth.user]);

  return {
    userId,
    displayName: auth.user?.fullName?.trim() || 'You',
    email: auth.user?.email ?? null,
    isAuthenticated: auth.isAuthenticated,
    authReady: auth.ready,
  };
}

/** Session viewer id — null on Beta when signed out; demo Michael only with explicit dev demo flag. */
export function useEffectiveViewerId(): string | null {
  const { userId } = useSessionUserId();
  return useMemo(() => {
    if (userId) return userId;
    if (isExplicitDevDemoModeEnabled()) return currentUser.id;
    return null;
  }, [userId]);
}

export function useRequireEffectiveViewerId(): string | null {
  const viewerId = useEffectiveViewerId();
  if (isRealAuthBetaPath() && !viewerId) return null;
  return viewerId ?? (isExplicitDevDemoModeEnabled() ? currentUser.id : null);
}
