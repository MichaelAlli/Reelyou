import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  EMPTY_FRIEND_DISCOVERY_STATE,
  type FriendDiscoveryState,
} from '@/friendDiscovery/friendDiscoveryTypes';

const STORAGE_KEY = 'reellyou.friendDiscovery.v1';

export async function loadFriendDiscoveryState(): Promise<FriendDiscoveryState> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...EMPTY_FRIEND_DISCOVERY_STATE };
    const parsed = JSON.parse(raw) as Partial<FriendDiscoveryState>;
    return {
      ...EMPTY_FRIEND_DISCOVERY_STATE,
      ...parsed,
      version: 1,
      dismissedSuggestionUserIds: parsed.dismissedSuggestionUserIds ?? [],
      contactMatchUserIds: parsed.contactMatchUserIds ?? [],
      googleMatchUserIds: parsed.googleMatchUserIds ?? [],
      facebookMatchUserIds: parsed.facebookMatchUserIds ?? [],
    };
  } catch {
    return { ...EMPTY_FRIEND_DISCOVERY_STATE };
  }
}

export async function saveFriendDiscoveryState(state: FriendDiscoveryState): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}
