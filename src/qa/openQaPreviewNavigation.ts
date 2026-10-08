import { Platform } from 'react-native';

import type { QaPreviewTarget } from '@/qa/qaPreviewRoutes';
import { withQaPreviewHref } from '@/qa/qaPreviewRoutes';

export type QaPreviewRouter = {
  push: (href: never) => void;
  replace: (href: never) => void;
};

/**
 * Splash preview lives on the root stack (`/qa/preview/splash`).
 * From `(post-welcome)/qa/screens`, a nested `push` can miss the root route —
 * use replace (native) or full document navigation (web).
 */
export function openQaPreviewNavigation(router: QaPreviewRouter, target: QaPreviewTarget): void {
  const href = withQaPreviewHref(target.href);

  if (target.id === 'splash') {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.location.assign(href);
      return;
    }
    router.replace(href as never);
    return;
  }

  router.push(href as never);
}
