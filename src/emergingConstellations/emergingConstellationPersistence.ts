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

export async function saveEmergingConstellationsState(
  state: EmergingConstellationsPersistedState,
): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* local beta — ignore write failures */
  }
}
