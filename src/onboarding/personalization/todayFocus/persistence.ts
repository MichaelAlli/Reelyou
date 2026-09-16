import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  EMPTY_TODAY_FOCUS,
  type TodayFocusRecord,
  type TodayFocusSource,
} from '@/onboarding/personalization/todayFocus/types';
import { getLocalDateKey } from '@/onboarding/personalization/todayFocus/dateKey';

const STORAGE_KEY = '@reellyou/today-focus';

function isTodayFocusSource(value: unknown): value is TodayFocusSource {
  return value === 'suggested' || value === 'custom';
}

function parseRecord(raw: string | null): TodayFocusRecord {
  if (!raw) return EMPTY_TODAY_FOCUS;
  try {
    const parsed = JSON.parse(raw) as Partial<TodayFocusRecord> & { updatedAt?: string | null };
    const value =
      typeof parsed.value === 'string' && parsed.value.trim().length > 0
        ? parsed.value.trim()
        : null;
    const source = isTodayFocusSource(parsed.source) ? parsed.source : null;
    const dateKey = typeof parsed.dateKey === 'string' ? parsed.dateKey : null;
    const selectedAt =
      typeof parsed.selectedAt === 'string'
        ? parsed.selectedAt
        : typeof parsed.updatedAt === 'string'
          ? parsed.updatedAt
          : null;
    const reflection =
      typeof parsed.reflection === 'string' && parsed.reflection.trim().length > 0
        ? parsed.reflection.trim()
        : null;
    const reflectionUpdatedAt =
      typeof parsed.reflectionUpdatedAt === 'string' ? parsed.reflectionUpdatedAt : null;
    return { value, source, dateKey, selectedAt, reflection, reflectionUpdatedAt };
  } catch {
    return EMPTY_TODAY_FOCUS;
  }
}

/** Drop stale focus/reflection when the calendar day changes. */
export function reconcileTodayFocusForToday(
  record: TodayFocusRecord,
  date = new Date(),
): TodayFocusRecord {
  const todayKey = getLocalDateKey(date);
  if (record.dateKey !== todayKey) {
    return { ...EMPTY_TODAY_FOCUS, dateKey: todayKey };
  }
  return record;
}

export async function loadTodayFocus(): Promise<TodayFocusRecord> {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    return reconcileTodayFocusForToday(parseRecord(stored));
  } catch {
    return reconcileTodayFocusForToday(EMPTY_TODAY_FOCUS);
  }
}

export async function saveTodayFocus(record: TodayFocusRecord): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(record));
  } catch {
    // Persistence failure should not block in-memory selection.
  }
}

export async function clearTodayFocusStorage(): Promise<void> {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch {
    // Non-blocking.
  }
}
