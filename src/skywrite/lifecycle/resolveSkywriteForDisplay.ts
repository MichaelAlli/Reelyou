import { isModerationContentSuppressedSync } from '@/moderation/moderationContentRegistry';
import { collectPublicSkywritesForBeacon } from '@/skywrite/beacon/skywriteBeaconEligibility';
import type { SkywriteContentLifecycleView } from '@/skywrite/lifecycle/skywriteContentLifecycleTypes';
import type { SkywriteRecord } from '@/skywrite/types';

/**
 * Display resolver — deleted content is not returned for normal rendering.
 * Provenance/metrics use tombstones + human-potential stores separately.
 */
export function resolveSkywriteForDisplay(
  localPosts: readonly SkywriteRecord[],
  skywriteId: string | undefined,
  lifecycle?: SkywriteContentLifecycleView,
): (SkywriteRecord & { authorId: string }) | null {
  if (!skywriteId) return null;
  if (lifecycle?.isContentDeleted(skywriteId)) {
    return null;
  }
  if (isModerationContentSuppressedSync('skywrite', skywriteId)) {
    return null;
  }
  const catalog = collectPublicSkywritesForBeacon(localPosts);
  return catalog.find((entry) => entry.id === skywriteId) ?? null;
}
