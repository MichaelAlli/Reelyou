import { resolveSkywriteForDisplay } from '@/skywrite/lifecycle/resolveSkywriteForDisplay';
import type { SkywriteContentLifecycleView } from '@/skywrite/lifecycle/skywriteContentLifecycleTypes';
import type { SkywriteRecord } from '@/skywrite/types';

/** Local posts + orbit fixtures — canonical lookup for threads and beacons. */
export function resolveSkywriteById(
  localPosts: readonly SkywriteRecord[],
  skywriteId: string | undefined,
  lifecycle?: SkywriteContentLifecycleView,
): (SkywriteRecord & { authorId: string }) | null {
  return resolveSkywriteForDisplay(localPosts, skywriteId, lifecycle);
}
