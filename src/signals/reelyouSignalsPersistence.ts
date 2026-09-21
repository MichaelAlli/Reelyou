import AsyncStorage from '@react-native-async-storage/async-storage';

import { EMPTY_SIGNALS_META, type ReelyouSignalsMetaState } from '@/signals/reelyouSignalTypes';

const STORAGE_KEY = '@reellyou/reelyou-signals-meta';

export async function loadReelyouSignalsMeta(): Promise<ReelyouSignalsMetaState> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...EMPTY_SIGNALS_META };
    const parsed = JSON.parse(raw) as ReelyouSignalsMetaState;
    return {
      dismissedSignalIds: parsed.dismissedSignalIds ?? [],
      acknowledgedSignalIds: parsed.acknowledgedSignalIds ?? [],
      snoozedUntil: parsed.snoozedUntil ?? {},
    };
  } catch {
    return { ...EMPTY_SIGNALS_META };
  }
}

export async function saveReelyouSignalsMeta(meta: ReelyouSignalsMetaState): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(meta));
}
