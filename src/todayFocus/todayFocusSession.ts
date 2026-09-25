import AsyncStorage from '@react-native-async-storage/async-storage';

import { getLocalDateKey } from '@/onboarding/personalization/todayFocus/dateKey';

const DISMISS_STORAGE_KEY = '@reellyou/today-focus-dismiss-date';

/** In-memory cache — hydrated from persistence on startup. */
let dismissedDateKey: string | null = null;
let dismissHydrated = false;

export async function hydrateTodayFocusDismissState(): Promise<void> {
  try {
    const stored = await AsyncStorage.getItem(DISMISS_STORAGE_KEY);
    dismissedDateKey = typeof stored === 'string' && stored.length > 0 ? stored : null;
  } catch {
    dismissedDateKey = null;
  } finally {
    dismissHydrated = true;
  }
}

export function isTodayFocusDismissHydrated(): boolean {
  return dismissHydrated;
}

export function dismissTodayFocusForDateKey(dateKey: string): void {
  dismissedDateKey = dateKey;
  void AsyncStorage.setItem(DISMISS_STORAGE_KEY, dateKey).catch(() => undefined);
}

export function isTodayFocusDismissed(dateKey: string): boolean {
  return dismissedDateKey === dateKey;
}

export function isTodayFocusDismissedForDateKey(dateKey: string): boolean {
  return dismissedDateKey === dateKey;
}

/** New local day — dismiss flag does not carry over. */
export function reconcileTodayFocusDismissForDate(dateKey: string = getLocalDateKey()): void {
  if (dismissedDateKey && dismissedDateKey !== dateKey) {
    dismissedDateKey = null;
    void AsyncStorage.removeItem(DISMISS_STORAGE_KEY).catch(() => undefined);
  }
}

export function clearTodayFocusDismiss(): void {
  dismissedDateKey = null;
  void AsyncStorage.removeItem(DISMISS_STORAGE_KEY).catch(() => undefined);
}
