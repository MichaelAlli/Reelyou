import AsyncStorage from '@react-native-async-storage/async-storage';

import type { StarPathUiChromeSnapshot } from '@/starpath/starpathPersistenceTypes';
import { safeJsonParse } from '@/starpath/starpathPersistenceRecovery';

const STORAGE_KEY = '@reellyou/starpath-ui-chrome';

export async function loadStarPathUiChrome(): Promise<StarPathUiChromeSnapshot | null> {
  const { value, ok } = safeJsonParse<StarPathUiChromeSnapshot>(await AsyncStorage.getItem(STORAGE_KEY));
  if (!ok || !value) return null;
  return {
    guideExpanded: value.guideExpanded === true,
    nextStepExpanded: value.nextStepExpanded !== false,
    guidePopupDismissedMessageId:
      typeof value.guidePopupDismissedMessageId === 'string'
        ? value.guidePopupDismissedMessageId
        : null,
    guideIntroPopupDismissed: value.guideIntroPopupDismissed === true,
    savedAt: typeof value.savedAt === 'number' ? value.savedAt : 0,
  };
}

export async function saveStarPathUiChrome(snapshot: StarPathUiChromeSnapshot): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
}
