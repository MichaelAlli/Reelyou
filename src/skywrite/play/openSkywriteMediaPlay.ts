import type { Router } from 'expo-router';

import { resolvePrimaryMediaStepIndex } from '@/skywrite/play/skywritePlayLogic';
import type { SkywriteRecord } from '@/skywrite/types';

/** Opens the full-screen viewer on the post’s primary media step (not the detail screen). */
export function openSkywriteMediaPlay(
  router: Pick<Router, 'push'>,
  record: Pick<SkywriteRecord, 'id' | 'text' | 'media' | 'mediaMode'>,
  options?: { autoplay?: boolean },
): void {
  const start = resolvePrimaryMediaStepIndex(record);
  const autoplay = options?.autoplay !== false ? '1' : '0';
  router.push(
    `/skywrite/play?scope=single&id=${encodeURIComponent(record.id)}&start=${start}&autoplay=${autoplay}` as never,
  );
}
