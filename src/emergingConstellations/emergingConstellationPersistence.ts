import AsyncStorage from '@react-native-async-storage/async-storage';

import type {
  CommunityEncouragement,
  CommunityMembership,
  CommunityPost,
  CommunityPostReply,
} from '@/emergingConstellations/emergingConstellationTypes';

const STORAGE_KEY = '@reellyou/emerging-constellations-v1';

export interface EmergingConstellationsPersistedState {
  dismissedSuggestionIds: readonly string[];
  dismissCooldownUntil: Readonly<Record<string, number>>;
  memberships: readonly CommunityMembership[];
  postsByCommunity: Readonly<Record<string, readonly CommunityPost[]>>;
  repliesByPost: Readonly<Record<string, readonly CommunityPostReply[]>>;
  encouragements: readonly CommunityEncouragement[];
  fixturesSeededForCommunityIds: readonly string[];
}

export const EMPTY_EMERGING_CONSTELLATIONS_STATE: EmergingConstellationsPersistedState = {
  dismissedSuggestionIds: [],
  dismissCooldownUntil: {},
  memberships: [],
  postsByCommunity: {},
  repliesByPost: {},
  encouragements: [],
  fixturesSeededForCommunityIds: [],
};

export async function loadEmergingConstellationsState(): Promise<EmergingConstellationsPersistedState> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY_EMERGING_CONSTELLATIONS_STATE;
    const parsed = JSON.parse(raw) as EmergingConstellationsPersistedState;
    return {
      ...EMPTY_EMERGING_CONSTELLATIONS_STATE,
      ...parsed,
    };
  } catch {
    return EMPTY_EMERGING_CONSTELLATIONS_STATE;
  }
}

function membershipKey(entry: CommunityMembership): string {
  return `${entry.userId}:${entry.communityId}`;
}

/** Prefer in-session joins when async hydration races a fresh join. */
export function mergeEmergingConstellationsPersistedState(
  loaded: EmergingConstellationsPersistedState,
  active: EmergingConstellationsPersistedState,
): EmergingConstellationsPersistedState {
  if (active.memberships.length === 0) {
    return { ...EMPTY_EMERGING_CONSTELLATIONS_STATE, ...loaded };
  }

  const mergedMemberships = new Map<string, CommunityMembership>();
  for (const entry of loaded.memberships) {
    mergedMemberships.set(membershipKey(entry), entry);
  }
  for (const entry of active.memberships) {
    const key = membershipKey(entry);
    const existing = mergedMemberships.get(key);
    if (!existing) {
      mergedMemberships.set(key, entry);
      continue;
    }
    if (entry.status === 'joined' && existing.status !== 'joined') {
      mergedMemberships.set(key, entry);
      continue;
    }
    if ((entry.joinedAt ?? 0) > (existing.joinedAt ?? 0)) {
      mergedMemberships.set(key, entry);
    }
  }

  return {
    ...EMPTY_EMERGING_CONSTELLATIONS_STATE,
    ...loaded,
    memberships: [...mergedMemberships.values()],
    postsByCommunity: {
      ...loaded.postsByCommunity,
      ...active.postsByCommunity,
    },
    repliesByPost: {
      ...loaded.repliesByPost,
      ...active.repliesByPost,
    },
    encouragements:
      active.encouragements.length > 0 ? active.encouragements : loaded.encouragements,
    fixturesSeededForCommunityIds: [
      ...new Set([
        ...loaded.fixturesSeededForCommunityIds,
        ...active.fixturesSeededForCommunityIds,
      ]),
    ],
  };
}

export async function saveEmergingConstellationsState(
  state: EmergingConstellationsPersistedState,
): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* local beta — ignore write failures */
  }
}
