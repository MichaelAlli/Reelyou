import { currentUser } from '@/data/mockData';
import { isReelyouAuthConfigured } from '@/auth/reellyouAuthConfig';
import type { StoredAuthUser } from '@/auth/reellyouAuthPersistence';

/** Signed-in server user when auth is configured; otherwise local mock owner id. */
export function resolveActiveUserId(sessionUser: StoredAuthUser | null): string {
  if (isReelyouAuthConfigured() && sessionUser?.id) return sessionUser.id;
  return currentUser.id;
}
