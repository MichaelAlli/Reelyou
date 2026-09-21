import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  EMPTY_DYNAMIC_WORLD,
  type StarPathDynamicWorldState,
} from '@/starpath/starpathDynamicWorldTypes';

const STORAGE_KEY = '@reellyou/starpath-dynamic-world';

export async function loadStarPathDynamicWorld(): Promise<StarPathDynamicWorldState> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...EMPTY_DYNAMIC_WORLD };
    const parsed = JSON.parse(raw) as StarPathDynamicWorldState;
    return {
      ...EMPTY_DYNAMIC_WORLD,
      ...parsed,
      nodes: Array.isArray(parsed.nodes) ? parsed.nodes : [],
      branchExtensions: Array.isArray(parsed.branchExtensions) ? parsed.branchExtensions : [],
      milestones: Array.isArray(parsed.milestones) ? parsed.milestones : [],
    };
  } catch {
    return { ...EMPTY_DYNAMIC_WORLD };
  }
}

export async function saveStarPathDynamicWorld(state: StarPathDynamicWorldState): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}
