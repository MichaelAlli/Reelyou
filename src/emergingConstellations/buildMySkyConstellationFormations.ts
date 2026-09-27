import type {
  CommunityMembership,
  EmergingConstellation,
} from '@/emergingConstellations/emergingConstellationTypes';
import { listJoinedEmergingConstellations } from '@/emergingConstellations/listJoinedEmergingConstellations';

export type MySkyConstellationFormationState = 'Joined' | 'Forming' | 'Emerging';

export interface MySkyConstellationFormation {
  constellation: EmergingConstellation;
  state: MySkyConstellationFormationState;
}

function stateForSuggestion(constellation: EmergingConstellation): MySkyConstellationFormationState {
  if (constellation.status === 'forming') return 'Forming';
  return 'Emerging';
}

/** Canonical Emerging Group formations visible in My Sky — no fabricated entries. */
export function buildMySkyConstellationFormations(
  activeSuggestion: EmergingConstellation | null,
  joinedMemberships: readonly CommunityMembership[],
  resolveConstellation: (constellationId?: string | null) => EmergingConstellation | null,
): MySkyConstellationFormation[] {
  const out: MySkyConstellationFormation[] = [];
  const joined = listJoinedEmergingConstellations(joinedMemberships, resolveConstellation);

  for (const constellation of joined) {
    out.push({ constellation, state: 'Joined' });
  }

  if (
    activeSuggestion &&
    !out.some((entry) => entry.constellation.id === activeSuggestion.id)
  ) {
    out.push({
      constellation: activeSuggestion,
      state: stateForSuggestion(activeSuggestion),
    });
  }

  return out;
}
