import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  NAVIGATION_TIP_IDS,
  type NavigationTipId,
} from '@/navigationTips/navigationTipIds';
import { clearSpatialFocusHints } from '@/spatialFocus/spatialFocusHintPersistence';

const KEY_PREFIX = '@reelyou/navigation-tip/v1/';

export async function wasNavigationTipDismissed(tipId: NavigationTipId): Promise<boolean> {
  try {
    return (await AsyncStorage.getItem(`${KEY_PREFIX}${tipId}`)) === '1';
  } catch {
    return false;
  }
}

export async function markNavigationTipDismissed(tipId: NavigationTipId): Promise<void> {
  try {
    await AsyncStorage.setItem(`${KEY_PREFIX}${tipId}`, '1');
  } catch {
    // non-critical
  }
}

export async function clearNavigationTips(): Promise<void> {
  try {
    await Promise.all(
      NAVIGATION_TIP_IDS.map((id) => AsyncStorage.removeItem(`${KEY_PREFIX}${id}`)),
    );
  } catch {
    // non-critical
  }
}

/** Clears contextual tips and spatial edge hints for Help replay. */
export async function resetAllNavigationGuidance(): Promise<void> {
  await Promise.all([clearNavigationTips(), clearSpatialFocusHints()]);
}
