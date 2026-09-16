import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  EMPTY_GUIDING_LIGHT_DISMISS,
  type GuidingLightDismissRecord,
} from '@/guidingLight/types';

const STORAGE_KEY = '@reellyou/guiding-light-dismiss';

function parseRecord(raw: string | null): GuidingLightDismissRecord {
  if (!raw) return EMPTY_GUIDING_LIGHT_DISMISS;
  try {
    const parsed = JSON.parse(raw) as Partial<GuidingLightDismissRecord>;
    return {
      dismissedLightId:
        typeof parsed.dismissedLightId === 'string' ? parsed.dismissedLightId : null,
      dismissedAt: typeof parsed.dismissedAt === 'string' ? parsed.dismissedAt : null,
    };
  } catch {
    return EMPTY_GUIDING_LIGHT_DISMISS;
  }
}

export async function loadGuidingLightDismiss(): Promise<GuidingLightDismissRecord> {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    return parseRecord(stored);
  } catch {
    return EMPTY_GUIDING_LIGHT_DISMISS;
  }
}

export async function saveGuidingLightDismiss(
  record: GuidingLightDismissRecord,
): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(record));
  } catch {
    // Non-blocking.
  }
}

export async function clearGuidingLightDismissStorage(): Promise<void> {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch {
    // Non-blocking.
  }
}
