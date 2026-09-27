import { devEmergingConstellationIfEligible } from '@/emergingConstellations/emergingConstellationFixtures';
import type {
  CommunityMembership,
  EmergingConstellation,
} from '@/emergingConstellations/emergingConstellationTypes';

/** Home / discovery surfaces — only canonical Emerging Constellation engine groups. */
export function listEligibleEmergingConstellations(
  activeSuggestion: EmergingConstellation | null,
  joinedMemberships: readonly CommunityMembership[],
  resolveConstellation: (constellationId?: string | null) => EmergingConstellation | null,
): EmergingConstellation[] {
  const canonical = devEmergingConstellationIfEligible();
  if (!canonical) return [];

  const out: EmergingConstellation[] = [];

  if (activeSuggestion?.id === canonical.id) {
    out.push(activeSuggestion);
  }

  for (const membership of joinedMemberships) {
    if (membership.status !== 'joined') continue;
    const resolved = resolveConstellation(membership.communityId);
    if (!resolved || resolved.id !== canonical.id) continue;
    if (!out.some((entry) => entry.id === resolved.id)) {
      out.push(resolved);
    }
  }

  return out;
}
