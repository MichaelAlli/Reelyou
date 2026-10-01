import { isReelyouAuthConfigured } from '@/auth/reellyouAuthConfig';

/** Per-account local keys when server auth is enabled — prevents cross-account bleed. */
export function userScopedStorageKey(baseKey: string, userId: string | null | undefined): string {
  if (!isReelyouAuthConfigured() || !userId?.trim()) return baseKey;
  return `${baseKey}::${userId.trim()}`;
}
