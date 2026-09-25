import type {
  ContributionStewardshipEvidence,
  ContributionStewardshipState,
} from '@/contributionStewardship/stewardshipTypes';

export interface StewardshipStoreState {
  evidence: ContributionStewardshipEvidence[];
  states: Record<string, ContributionStewardshipState>;
}

function stateKey(contributorUserId: string, skyAreaId: string): string {
  return `${contributorUserId}::${skyAreaId}`;
}

export function createContributionStewardshipStore(
  initial: StewardshipStoreState = { evidence: [], states: {} },
) {
  let state = initial;

  return {
    getState: () => state,
    hasEvidence(id: string): boolean {
      return state.evidence.some((entry) => entry.id === id);
    },
    appendEvidence(entry: ContributionStewardshipEvidence) {
      if (state.evidence.some((existing) => existing.id === entry.id)) {
        return null;
      }
      state = { ...state, evidence: [...state.evidence, entry] };
      return entry;
    },
    setAreaState(areaState: ContributionStewardshipState) {
      const key = stateKey(areaState.contributorUserId, areaState.skyAreaId);
      state = {
        ...state,
        states: { ...state.states, [key]: areaState },
      };
      return areaState;
    },
    getAreaState(contributorUserId: string, skyAreaId: string) {
      return state.states[stateKey(contributorUserId, skyAreaId)];
    },
    listEvidenceForArea(contributorUserId: string, skyAreaId: string) {
      return state.evidence.filter(
        (entry) =>
          entry.contributorUserId === contributorUserId && entry.skyAreaId === skyAreaId,
      );
    },
  };
}

export type ContributionStewardshipStore = ReturnType<typeof createContributionStewardshipStore>;
