import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  DEFAULT_USER_PREFERENCES,
  PREFERENCES_VERSION,
  type UserPreferencesState,
} from '@/preferences/userPreferencesTypes';

const STORAGE_KEY = '@reellyou/user-preferences';

export async function loadUserPreferences(): Promise<UserPreferencesState> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_USER_PREFERENCES };
    const parsed = JSON.parse(raw) as Partial<UserPreferencesState>;
    return {
      ...DEFAULT_USER_PREFERENCES,
      ...parsed,
      signalPreferences: { ...DEFAULT_USER_PREFERENCES.signalPreferences, ...parsed.signalPreferences },
      messagingPreferences: {
        ...DEFAULT_USER_PREFERENCES.messagingPreferences,
        ...parsed.messagingPreferences,
      },
      discoveryPreferences: {
        ...DEFAULT_USER_PREFERENCES.discoveryPreferences,
        ...parsed.discoveryPreferences,
        prioritizeSharedCommunities:
          parsed.discoveryPreferences?.prioritizeSharedCommunities ??
          DEFAULT_USER_PREFERENCES.discoveryPreferences.prioritizeSharedCommunities,
      },
      guidePreferences: { ...DEFAULT_USER_PREFERENCES.guidePreferences, ...parsed.guidePreferences },
      personalizationPreferences: {
        ...DEFAULT_USER_PREFERENCES.personalizationPreferences,
        ...parsed.personalizationPreferences,
      },
      emotionalContextPreference: {
        ...DEFAULT_USER_PREFERENCES.emotionalContextPreference,
        ...parsed.emotionalContextPreference,
      },
      accessibilityPreferences: {
        ...DEFAULT_USER_PREFERENCES.accessibilityPreferences,
        ...parsed.accessibilityPreferences,
      },
      preferencesVersion: PREFERENCES_VERSION,
    };
  } catch {
    return { ...DEFAULT_USER_PREFERENCES };
  }
}

export async function saveUserPreferences(state: UserPreferencesState): Promise<void> {
  await AsyncStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ ...state, preferencesVersion: PREFERENCES_VERSION, updatedAt: Date.now() }),
  );
}
