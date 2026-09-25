import type { TodayFocusRecord } from '@/onboarding/personalization/todayFocus/types';

type FocusChangeListener = (record: TodayFocusRecord) => void;

let listener: FocusChangeListener | null = null;

export function registerTodayFocusChangeListener(fn: FocusChangeListener | null): void {
  listener = fn;
}

export function notifyTodayFocusChanged(record: TodayFocusRecord): void {
  listener?.(record);
}
