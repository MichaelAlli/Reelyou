import type { Router } from 'expo-router';

import { resolvePrimaryMediaStepIndex } from '@/skywrite/play/skywritePlayLogic';
import type { SkywriteRecord } from '@/skywrite/types';

/** Persistent post viewer — not SkyReel (no story timer / sequence engine). */
export function openSkywritePostView(
  router: Pick<Router, 'push'>,
  post: Pick<SkywriteRecord, 'id' | 'text' | 'media' | 'mediaMode'>,
): void {
  const id = encodeURIComponent(post.id);
  const start = resolvePrimaryMediaStepIndex(post);
  router.push(`/skywrite/moment?skywriteId=${id}&step=${start}` as never);
}
