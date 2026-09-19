import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  DEFAULT_SKY_VISIBILITY_SETTINGS,
  normalizeSkyVisibilitySettings,
  type SkyVisibilitySettings,
} from '@/mySky/skyVisibilitySettings';

const STORAGE_KEY = '@reellyou/my-sky-visibility';

export async function loadSkyVisibilitySettings(): Promise<SkyVisibilitySettings> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_SKY_VISIBILITY_SETTINGS, contentOverrides: {} };
    return normalizeSkyVisibilitySettings(JSON.parse(raw) as Partial<SkyVisibilitySettings>);
  } catch {
    return { ...DEFAULT_SKY_VISIBILITY_SETTINGS, contentOverrides: {} };
  }
}

export async function saveSkyVisibilitySettings(settings: SkyVisibilitySettings): Promise<void> {
  const normalized = normalizeSkyVisibilitySettings(settings);
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
}
