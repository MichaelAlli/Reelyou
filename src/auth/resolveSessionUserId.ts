import { isExplicitDevDemoModeEnabled } from '@/auth/demoMode';
import { resolveActiveUserId } from '@/auth/resolveActiveUserId';
import type { StoredAuthUser } from '@/auth/reellyouAuthPersistence';
import { currentUser } from '@/data/mockData';

/** Viewer/owner id for social and content actions — never silent Michael fallback on Beta. */
export function resolveSessionUserId(authUser: StoredAuthUser | null): string | null {
  return resolveActiveUserId(authUser);
}

/**
 * @deprecated Prefer resolveSessionUserId + null checks. Demo fallback only in explicit offline demo mode.
 */
export function resolveSessionUserIdOrDemo(authUser: StoredAuthUser | null): string | null {
  const id = resolveSessionUserId(authUser);
  if (id) return id;
  if (isExplicitDevDemoModeEnabled()) return currentUser.id;
  return null;
}
