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
import {
  hydrateTodayFocusHomeCollapse,
  isTodayFocusHomeCollapseHydrated,
  isTodayFocusHomeCollapsed,
  reconcileTodayFocusHomeCollapse,
} from '@/todayFocus/todayFocusHomeCollapse';

export function useTodayFocusHomePresentation() {
  const { todayFocus } = useOnboarding();
  const [dateKey, setDateKey] = useState(getLocalDateKey);
  const [dismissReady, setDismissReady] = useState(
    isTodayFocusDismissHydrated() && isTodayFocusHomeCollapseHydrated(),
  );
  const [homeCollapsed, setHomeCollapsed] = useState(() =>
    isTodayFocusHomeCollapsed(dateKey),
  );

  useEffect(() => {
    if (dismissReady) return;
    void Promise.all([hydrateTodayFocusDismissState(), hydrateTodayFocusHomeCollapse()]).then(
      () => {
        setDismissReady(true);
        setHomeCollapsed(isTodayFocusHomeCollapsed(dateKey));
      },
    );
  }, [dateKey, dismissReady]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      if (state !== 'active') return;
      const nextKey = getLocalDateKey();
      if (nextKey === dateKey) return;
      reconcileTodayFocusDismissForDate(nextKey);
      reconcileTodayFocusHomeCollapse(nextKey);
      setDateKey(nextKey);
      setHomeCollapsed(isTodayFocusHomeCollapsed(nextKey));
    });
    return () => subscription.remove();
  }, [dateKey]);

  useEffect(() => {
    reconcileTodayFocusDismissForDate(dateKey);
    reconcileTodayFocusHomeCollapse(dateKey);
    setHomeCollapsed(isTodayFocusHomeCollapsed(dateKey));
  }, [dateKey]);

  const presentation = useMemo((): TodayFocusHomePresentation => {
    if (!dismissReady) return 'dismissed';
    const reconciled = reconcileTodayFocusForToday(todayFocus);
    return resolveTodayFocusHomePresentation(reconciled, dateKey);
  }, [dateKey, dismissReady, todayFocus.dateKey, todayFocus.source, todayFocus.value]);

  const focusPreview = todayFocus.value?.trim() ?? '';

  return {
    presentation,
    dateKey,
    focusPreview,
    dismissReady,
    homeCollapsed,
    setHomeCollapsed,
  };
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
