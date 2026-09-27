import {
  DEV_EMERGING_CONSTELLATION,
  DEV_EMERGING_CONSTELLATION_ID,
} from '@/emergingConstellations/emergingConstellationFixtures';
import type {
  CommunityMembership,
  EmergingConstellation,
} from '@/emergingConstellations/emergingConstellationTypes';

/** Joined canonical Emerging Groups only — for My Sky navigation (not Home discovery). */
export function listJoinedEmergingConstellations(
  joinedMemberships: readonly CommunityMembership[],
  resolveConstellation: (constellationId?: string | null) => EmergingConstellation | null,
): EmergingConstellation[] {
  const out: EmergingConstellation[] = [];
  for (const membership of joinedMemberships) {
    if (membership.status !== 'joined') continue;
    const communityId = membership.communityId.trim();
    if (!communityId) continue;
    let resolved = resolveConstellation(communityId);
    if (
      !resolved &&
      communityId === DEV_EMERGING_CONSTELLATION_ID
    ) {
      resolved = DEV_EMERGING_CONSTELLATION;
    }
    if (!resolved) continue;
    if (!out.some((entry) => entry.id === resolved.id)) {
      out.push(resolved);
    }
  }
  return out;
}
