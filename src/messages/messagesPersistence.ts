import AsyncStorage from '@react-native-async-storage/async-storage';

import { isExplicitDevDemoModeEnabled } from '@/auth/demoMode';
import { buildFixtureMessagesState } from '@/messages/messagesFixtures';
import { EMPTY_MESSAGES_STATE, type MessagesState } from '@/messages/messagesTypes';

function emptyOrFixtureSeed(): MessagesState {
  return isExplicitDevDemoModeEnabled() ? buildFixtureMessagesState() : { ...EMPTY_MESSAGES_STATE };
}

const STORAGE_KEY = '@reellyou/messages';

export async function loadMessagesState(): Promise<MessagesState> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const seed = emptyOrFixtureSeed();
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
      return seed;
    }
    const parsed = JSON.parse(raw) as MessagesState;
    return {
      ...EMPTY_MESSAGES_STATE,
      ...parsed,
      threadsById: parsed.threadsById ?? {},
      threadIds: parsed.threadIds ?? [],
      messagesById: parsed.messagesById ?? {},
      unreadThreadIds: parsed.unreadThreadIds ?? [],
      mutedThreadIds: parsed.mutedThreadIds ?? [],
      blockedUserIds: parsed.blockedUserIds ?? [],
      limitedUserIds: parsed.limitedUserIds ?? [],
      messageRequests: parsed.messageRequests ?? [],
    };
  } catch {
    return emptyOrFixtureSeed();
  }
}

export async function saveMessagesState(state: MessagesState): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}
