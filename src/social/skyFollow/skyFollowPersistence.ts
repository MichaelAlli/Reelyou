import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@reellyou/sky-follows';

export async function loadFollowedSkyUserIds(): Promise<string[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((id): id is string => typeof id === 'string' && id.length > 0);
  } catch {
    return [];
  }
}

export async function saveFollowedSkyUserIds(ids: string[]): Promise<void> {
  const unique = [...new Set(ids)];
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(unique));
}
