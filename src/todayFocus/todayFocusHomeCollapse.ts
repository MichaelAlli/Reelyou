import AsyncStorage from '@react-native-async-storage/async-storage';

import { getLocalDateKey } from '@/onboarding/personalization/todayFocus/dateKey';

const STORAGE_KEY = '@reellyou/today-focus-home-collapsed-date';

let collapsedDateKey: string | null = null;
let hydrated = false;

export async function hydrateTodayFocusHomeCollapse(): Promise<void> {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    collapsedDateKey = typeof stored === 'string' && stored.length > 0 ? stored : null;
  } catch {
    collapsedDateKey = null;
  } finally {
    hydrated = true;
  }
}

export function isTodayFocusHomeCollapseHydrated(): boolean {
  return hydrated;
}

export function isTodayFocusHomeCollapsed(dateKey: string = getLocalDateKey()): boolean {
  return collapsedDateKey === dateKey;
}

export function setTodayFocusHomeCollapsed(
  collapsed: boolean,
  dateKey: string = getLocalDateKey(),
): void {
  if (collapsed) {
    collapsedDateKey = dateKey;
    void AsyncStorage.setItem(STORAGE_KEY, dateKey).catch(() => undefined);
    return;
  }
  collapsedDateKey = null;
  void AsyncStorage.removeItem(STORAGE_KEY).catch(() => undefined);
}

/** New local day — collapse flag does not carry over. */
export function reconcileTodayFocusHomeCollapse(dateKey: string = getLocalDateKey()): void {
  if (collapsedDateKey && collapsedDateKey !== dateKey) {
    collapsedDateKey = null;
    void AsyncStorage.removeItem(STORAGE_KEY).catch(() => undefined);
  }
}
