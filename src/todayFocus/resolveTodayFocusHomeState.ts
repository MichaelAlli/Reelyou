import { getLocalDateKey } from '@/onboarding/personalization/todayFocus/dateKey';
import type { TodayFocusRecord } from '@/onboarding/personalization/todayFocus/types';
import { isTodayFocusDismissedForDateKey } from '@/todayFocus/todayFocusSession';

export type TodayFocusHomePresentation = 'available' | 'set' | 'dismissed';

export function resolveTodayFocusHomePresentation(
  record: TodayFocusRecord,
  dateKey: string = getLocalDateKey(),
): TodayFocusHomePresentation {
  if (isTodayFocusDismissedForDateKey(dateKey)) {
    return 'dismissed';
  }
  const hasActiveFocus =
    Boolean(record.value?.trim()) &&
    Boolean(record.source) &&
    record.dateKey === dateKey;
  if (hasActiveFocus) {
    return 'set';
  }
  return 'available';
}
