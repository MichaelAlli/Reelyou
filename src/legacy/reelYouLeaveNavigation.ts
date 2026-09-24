import type { useRouter } from 'expo-router';

/** Canonical Legacy screen when REEL-YOU has no navigation history (e.g. direct URL). */
export const LEGACY_CANONICAL_ROUTE = '/legacy' as const;

export type ReelYouLeaveRouter = Pick<
  ReturnType<typeof useRouter>,
  'canGoBack' | 'back' | 'replace'
>;

export function leaveReelYouRoute(router: ReelYouLeaveRouter): void {
  if (router.canGoBack()) {
    router.back();
    return;
  }
  router.replace(LEGACY_CANONICAL_ROUTE as never);
}
