import { currentUser } from '@/data/mockData';
import { isContributionBeaconDemoEnabled } from '@/constants/devFlags';
import { ORBIT_PROFILE_SKYWRITE_FIXTURES } from '@/profile/orbitProfileSkywriteFixtures';
import { buildDemoContributionBeaconSkywrites } from '@/skywrite/beacon/contributionBeaconDemoFixtures';
import type { SkywriteRecord } from '@/skywrite/types';

export type { BeaconEligibleSkywrite } from '@/skywrite/beacon/beaconMatchEngine';

export function withAuthorId(record: SkywriteRecord, fallbackAuthorId: string): SkywriteRecord & {
  authorId: string;
} {
  return {
    ...record,
    authorId: record.authorId ?? fallbackAuthorId,
  };
}

/** Public catalog for beacon routing — fixtures + local posts (deduped by id). */
export function collectPublicSkywritesForBeacon(
  localPosts: readonly SkywriteRecord[],
  viewerId: string = currentUser.id,
): Array<SkywriteRecord & { authorId: string }> {
  if (isContributionBeaconDemoEnabled()) {
    return buildDemoContributionBeaconSkywrites();
  }

  const byId = new Map<string, SkywriteRecord & { authorId: string }>();

  for (const [ownerId, posts] of Object.entries(ORBIT_PROFILE_SKYWRITE_FIXTURES)) {
    for (const post of posts) {
      byId.set(post.id, withAuthorId(post, ownerId));
    }
  }

  for (const post of localPosts) {
    byId.set(post.id, withAuthorId(post, viewerId));
  }

  return [...byId.values()];
}

export function beaconSignalIdForSkywrite(skywriteId: string): string {
  return `sig-beacon-sw-${skywriteId}`;
}
