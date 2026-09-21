import AsyncStorage from '@react-native-async-storage/async-storage';

import type { SpatialFocusHintSurface } from '@/spatialFocus/types';

const KEY_PREFIX = '@reelyou/spatial-focus-hint/v1/';

export async function wasSpatialFocusHintShown(surface: SpatialFocusHintSurface): Promise<boolean> {
  try {
    const value = await AsyncStorage.getItem(`${KEY_PREFIX}${surface}`);
    return value === '1';
  } catch {
    return false;
  }
}

export async function markSpatialFocusHintShown(surface: SpatialFocusHintSurface): Promise<void> {
  try {
    await AsyncStorage.setItem(`${KEY_PREFIX}${surface}`, '1');
  } catch {
    // non-critical
  }
}

export function spatialFocusHintCopy(surface: SpatialFocusHintSurface): string {
  if (surface === 'starpath') {
    return 'Tap the edges to move between nearby points.';
  }
  return 'Tap the edges to move between nearby stars.';
}
