import AsyncStorage from '@react-native-async-storage/async-storage';

import { EMPTY_SIGNAL_STATE, type StarPathSignalState } from '@/starpath/starpathSignalTypes';

const STORAGE_KEY = '@reellyou/starpath-signals';

export async function loadStarPathSignalState(): Promise<StarPathSignalState> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...EMPTY_SIGNAL_STATE };
    return { ...EMPTY_SIGNAL_STATE, ...(JSON.parse(raw) as StarPathSignalState) };
  } catch {
    return { ...EMPTY_SIGNAL_STATE };
  }
}

export async function saveStarPathSignalState(state: StarPathSignalState): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}
