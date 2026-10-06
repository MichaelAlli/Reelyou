import { isExplicitDevDemoModeEnabled } from '@/auth/demoMode';
import { isReelyouAuthConfigured } from '@/auth/reellyouAuthConfig';
import type { StoredAuthUser } from '@/auth/reellyouAuthPersistence';
import { currentUser } from '@/data/mockData';

/**
 * Signed-in user id when auth is configured (null when signed out).
 * Offline builds: demo Michael only when EXPO_PUBLIC_ENABLE_DEMO_MODE=1 in __DEV__.
 */
export function resolveActiveUserId(sessionUser: StoredAuthUser | null): string | null {
  if (isReelyouAuthConfigured()) {
    const id = sessionUser?.id?.trim();
    return id ? id : null;
  }
  if (isExplicitDevDemoModeEnabled()) {
    return currentUser.id;
  }
  return null;
}
