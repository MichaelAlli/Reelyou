import { collectPublicSkywritesForBeacon } from '@/skywrite/beacon/skywriteBeaconEligibility';
import type { SkywriteRecord } from '@/skywrite/types';

/** Local posts + orbit fixtures — canonical lookup for threads and beacons. */
export function resolveSkywriteById(
  localPosts: readonly SkywriteRecord[],
  skywriteId: string | undefined,
): (SkywriteRecord & { authorId: string }) | null {
  if (!skywriteId) return null;
  const catalog = collectPublicSkywritesForBeacon(localPosts);
  return catalog.find((entry) => entry.id === skywriteId) ?? null;
}
