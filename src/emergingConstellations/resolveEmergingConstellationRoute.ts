import type { CommunityMembership } from '@/emergingConstellations/emergingConstellationTypes';

/** Canonical Emerging Group destination — preview for unseen, main group when joined. */
export function resolveEmergingConstellationRoute(
  constellationId: string,
  membership: CommunityMembership | null | undefined,
): `/emerging-constellation/preview?id=${string}` | `/emerging-constellation?id=${string}` {
  if (membership?.status === 'joined') {
    return `/emerging-constellation?id=${encodeURIComponent(constellationId)}`;
  }
  return `/emerging-constellation/preview?id=${encodeURIComponent(constellationId)}`;
}
