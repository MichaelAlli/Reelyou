import AsyncStorage from '@react-native-async-storage/async-storage';

import type { SkyHeaderStyleId } from '@/profile/skyHeaderStyleTypes';

const KEY = '@reellyou/sky-header-style';

const VALID: SkyHeaderStyleId[] = ['starlight', 'golden_glow', 'constellation'];

export async function loadSkyHeaderStyleId(userId: string): Promise<SkyHeaderStyleId> {
  try {
    const raw = await AsyncStorage.getItem(`${KEY}:${userId}`);
    if (raw && VALID.includes(raw as SkyHeaderStyleId)) {
      return raw as SkyHeaderStyleId;
    }
  } catch {
    /* default */
  }
  return 'starlight';
}

export async function saveSkyHeaderStyleId(
  userId: string,
  styleId: SkyHeaderStyleId,
): Promise<void> {
  await AsyncStorage.setItem(`${KEY}:${userId}`, styleId);
}
