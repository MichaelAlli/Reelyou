import type { useRouter } from 'expo-router';

import { LEGACY_CANONICAL_ROUTE } from '@/legacy/reelYouLeaveNavigation';

export type LegacyRippleLeaveRouter = Pick<
  ReturnType<typeof useRouter>,
  'canGoBack' | 'back' | 'replace'
>;

export function leaveLegacyRippleRoute(router: LegacyRippleLeaveRouter): void {
  if (router.canGoBack()) {
    router.back();
    return;
  }
  router.replace(LEGACY_CANONICAL_ROUTE as never);
}
