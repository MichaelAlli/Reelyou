import { useEffect, useMemo, useState } from 'react';
import { Alert, AppState } from 'react-native';

import { useOnboarding } from '@/onboarding';
import { getLocalDateKey } from '@/onboarding/personalization/todayFocus/dateKey';
import { reconcileTodayFocusForToday } from '@/onboarding/personalization/todayFocus/persistence';
import {
  resolveTodayFocusHomePresentation,
  type TodayFocusHomePresentation,
} from '@/todayFocus/resolveTodayFocusHomeState';
import {
  hydrateTodayFocusDismissState,
  isTodayFocusDismissHydrated,
  reconcileTodayFocusDismissForDate,
} from '@/todayFocus/todayFocusSession';

export function useTodayFocusHomePresentation() {
  const { todayFocus } = useOnboarding();
  const [dateKey, setDateKey] = useState(getLocalDateKey);
  const [dismissReady, setDismissReady] = useState(isTodayFocusDismissHydrated());

  useEffect(() => {
    if (!dismissReady) {
      void hydrateTodayFocusDismissState().then(() => setDismissReady(true));
    }
  }, [dismissReady]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      if (state !== 'active') return;
      const nextKey = getLocalDateKey();
      if (nextKey === dateKey) return;
      reconcileTodayFocusDismissForDate(nextKey);
      setDateKey(nextKey);
    });
    return () => subscription.remove();
  }, [dateKey]);

  useEffect(() => {
    reconcileTodayFocusDismissForDate(dateKey);
  }, [dateKey]);

  const presentation = useMemo((): TodayFocusHomePresentation => {
    if (!dismissReady) return 'dismissed';
    const reconciled = reconcileTodayFocusForToday(todayFocus);
    return resolveTodayFocusHomePresentation(reconciled, dateKey);
  }, [dateKey, dismissReady, todayFocus.dateKey, todayFocus.source, todayFocus.value]);

  const focusPreview = todayFocus.value?.trim() ?? '';

  return { presentation, dateKey, focusPreview, dismissReady };
}

export function showTodayFocusQuickPreview(focusText: string, onView: () => void, onChange: () => void) {
  Alert.alert(
    "Today's Focus",
    focusText || 'Your focus for today',
    [
      { text: 'Change', onPress: onChange },
      { text: 'View', onPress: onView, isPreferred: true },
      { text: 'Cancel', style: 'cancel' },
    ],
    { cancelable: true },
  );
}
