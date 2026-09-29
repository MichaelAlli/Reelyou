import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert } from 'react-native';

import { getLocalDateKey } from '@/onboarding/personalization/todayFocus/dateKey';
import { reconcileTodayFocusForToday } from '@/onboarding/personalization/todayFocus/persistence';
import {
  resolveTodayFocusHomePresentation,
  type TodayFocusHomePresentation,
} from '@/todayFocus/resolveTodayFocusHomeState';
import {
  dismissTodayFocusForDateKey,
  hydrateTodayFocusDismissState,
  isTodayFocusDismissHydrated,
  reconcileTodayFocusDismissForDate,
} from '@/todayFocus/todayFocusSession';
import { useOnboarding } from '@/onboarding';

export function useTodayFocusHomePresentation() {
  const { todayFocus } = useOnboarding();
  const [dateKey, setDateKey] = useState(getLocalDateKey);
  const [dismissReady, setDismissReady] = useState(isTodayFocusDismissHydrated());
  const [dismissTick, setDismissTick] = useState(0);

  useEffect(() => {
    void hydrateTodayFocusDismissState().then(() => setDismissReady(true));
  }, []);

  useEffect(() => {
    const tick = () => {
      const nextKey = getLocalDateKey();
      if (nextKey === dateKey) return;
      reconcileTodayFocusDismissForDate(nextKey);
      setDateKey(nextKey);
    };
    const interval = setInterval(tick, 60_000);
    return () => clearInterval(interval);
  }, [dateKey]);

  useEffect(() => {
    reconcileTodayFocusDismissForDate(dateKey);
  }, [dateKey]);

  const presentation = useMemo((): TodayFocusHomePresentation => {
    if (!dismissReady) return 'hidden';
    const reconciled = reconcileTodayFocusForToday(todayFocus);
    return resolveTodayFocusHomePresentation(reconciled, dateKey);
  }, [dateKey, dismissReady, dismissTick, todayFocus.dateKey, todayFocus.source, todayFocus.value]);

  const focusPreview = todayFocus.value?.trim() ?? '';

  const dismissHomeCard = useCallback(() => {
    dismissTodayFocusForDateKey(dateKey);
    setDismissTick((value) => value + 1);
  }, [dateKey]);

  return {
    presentation,
    focusPreview,
    dismissReady,
    dateKey,
    dismissHomeCard,
  };
}

export function showTodayFocusQuickPreview(focusText: string, onView: () => void, onChange: () => void) {
  Alert.alert(
    "Today's Focus",
    focusText || 'Open Today’s Focus to set or review your focus for today.',
    [
      { text: 'Change', onPress: onChange },
      { text: 'View', onPress: onView },
      { text: 'Cancel', style: 'cancel' },
    ],
  );
}
