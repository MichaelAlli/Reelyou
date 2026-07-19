import AsyncStorage from '@react-native-async-storage/async-storage';

import type { ThemeMode } from './types';
import { THEME_MODES } from './types';

const STORAGE_KEY = '@reellyou/theme-mode';

export const DEFAULT_THEME_MODE: ThemeMode = 'system';

function isThemeMode(value: string | null): value is ThemeMode {
  return value != null && (THEME_MODES as string[]).includes(value);
}

export async function loadThemeMode(): Promise<ThemeMode> {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    return isThemeMode(stored) ? stored : DEFAULT_THEME_MODE;
  } catch {
    return DEFAULT_THEME_MODE;
  }
}

export async function saveThemeMode(mode: ThemeMode): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, mode);
  } catch {
    // Persistence failure should not block theme selection in memory.
  }
}
