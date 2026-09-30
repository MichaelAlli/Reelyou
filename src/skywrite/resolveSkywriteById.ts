import { getCachedSkywrite } from '@/social/sharedSkywriteCache';
import { collectPublicSkywritesForBeacon } from '@/skywrite/beacon/skywriteBeaconEligibility';
import { resolveSkywriteForDisplay } from '@/skywrite/lifecycle/resolveSkywriteForDisplay';
import type { SkywriteContentLifecycleView } from '@/skywrite/lifecycle/skywriteContentLifecycleTypes';
import type { SkywriteRecord } from '@/skywrite/types';

/** Local posts + orbit/demo fixtures — canonical lookup for threads, beacons, and Play Sky. */
export function resolveSkywriteById(
  localPosts: readonly SkywriteRecord[],
  skywriteId: string | undefined,
  lifecycle?: SkywriteContentLifecycleView,
): (SkywriteRecord & { authorId: string }) | null {
  const cached = skywriteId ? getCachedSkywrite(skywriteId) : undefined;
  const catalog = collectPublicSkywritesForBeacon(
    cached ? [...localPosts, cached] : localPosts,
  );
  return resolveSkywriteForDisplay(catalog, skywriteId, lifecycle);
}
