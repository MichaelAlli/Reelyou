import { getLocalDateKey } from '@/onboarding/personalization/todayFocus/dateKey';
import type { TodayFocusRecord } from '@/onboarding/personalization/todayFocus/types';
import { isTodayFocusDismissedForDateKey } from '@/todayFocus/todayFocusSession';

/** Home card visibility — focus data may still exist when hidden. */
export type TodayFocusHomePresentation = 'available' | 'hidden';

export function resolveTodayFocusHomePresentation(
  record: TodayFocusRecord,
  dateKey: string = getLocalDateKey(),
): TodayFocusHomePresentation {
  if (isTodayFocusDismissedForDateKey(dateKey)) {
    return 'hidden';
  }
  const hasActiveFocusToday =
    Boolean(record.value?.trim()) &&
    Boolean(record.source) &&
    record.dateKey === dateKey;
  if (hasActiveFocusToday) {
    return 'hidden';
  }
  return 'available';
}
