import { Platform } from 'react-native';

import type { QaPreviewTarget } from '@/qa/qaPreviewRoutes';
import { withQaPreviewHref } from '@/qa/qaPreviewRoutes';

export type QaPreviewRouter = {
  push: (href: never) => void;
  replace: (href: never) => void;
};

/** Root-stack screens (outside `(post-welcome)`). Nested router.push often lands on the wrong screen. */
const QA_ROOT_STACK_TARGET_IDS = new Set(['splash', 'welcome']);

/**
 * Splash / Welcome previews live on the root stack.
 * From `(post-welcome)/qa/screens`, a nested `push` can miss the root route —
 * use replace (native) or full document navigation (web).
 */
export function openQaPreviewNavigation(router: QaPreviewRouter, target: QaPreviewTarget): void {
  const href = withQaPreviewHref(target.href);

  if (QA_ROOT_STACK_TARGET_IDS.has(target.id)) {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.location.assign(href);
      return;
    }
    router.replace(href as never);
    return;
  }

  router.push(href as never);
}
