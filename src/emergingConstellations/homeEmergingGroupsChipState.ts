import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@reellyou/home-emerging-groups-chip-hidden-signature-v1';

/** Hide Home chip only — same eligible groups stay in Signal / My Sky. */
export async function loadHomeEmergingGroupsHiddenSignature(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

export async function saveHomeEmergingGroupsHiddenSignature(signature: string): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, signature);
  } catch {
    /* local beta */
  }
}

export function emergingGroupsHomeSignature(groupIds: readonly string[]): string {
  return [...groupIds].sort().join('|');
}
