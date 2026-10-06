import { isExplicitDevDemoModeEnabled } from '@/auth/demoMode';
import { isReelyouAuthConfigured } from '@/auth/reellyouAuthConfig';
import { currentUser } from '@/data/mockData';

/** Canonical owner for library/sheet builders — never silently defaults to demo Michael on Beta auth. */
export function resolveLibraryOwnerUserId(explicit?: string | null): string | null {
  const trimmed = explicit?.trim();
  if (trimmed) return trimmed;
  if (isExplicitDevDemoModeEnabled()) return currentUser.id;
  return null;
}
