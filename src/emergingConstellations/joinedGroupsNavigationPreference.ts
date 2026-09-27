import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@reellyou/my-sky-joined-groups-nav-v1';

/** Persisted familiarity for My Sky Joined Groups control — no behavioral tracking beyond opens. */
export interface JoinedGroupsNavigationPreference {
  hasSeenCoachmark: boolean;
  hasSeenConstellationsCoachmark: boolean;
  openCount: number;
  compactModeEligible: boolean;
}

export const EMPTY_JOINED_GROUPS_NAV_PREFERENCE: JoinedGroupsNavigationPreference = {
  hasSeenCoachmark: false,
  hasSeenConstellationsCoachmark: false,
  openCount: 0,
  compactModeEligible: false,
};

/** Beta: keep text label for clarity; raise threshold to enable compact icon-only later. */
export const JOINED_GROUPS_COMPACT_AFTER_OPENS = 999;

export async function loadJoinedGroupsNavigationPreference(): Promise<JoinedGroupsNavigationPreference> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY_JOINED_GROUPS_NAV_PREFERENCE;
    const parsed = JSON.parse(raw) as JoinedGroupsNavigationPreference;
    return { ...EMPTY_JOINED_GROUPS_NAV_PREFERENCE, ...parsed };
  } catch {
    return EMPTY_JOINED_GROUPS_NAV_PREFERENCE;
  }
}

export async function saveJoinedGroupsNavigationPreference(
  state: JoinedGroupsNavigationPreference,
): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* local beta */
  }
}

export function joinedGroupsUseCompactLabel(preference: JoinedGroupsNavigationPreference): boolean {
  if (JOINED_GROUPS_COMPACT_AFTER_OPENS > 100) return false;
  return (
    preference.compactModeEligible &&
    preference.openCount >= JOINED_GROUPS_COMPACT_AFTER_OPENS
  );
}
