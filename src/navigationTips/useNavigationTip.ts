import { useCallback, useEffect, useState } from 'react';

import type { NavigationTipId } from '@/navigationTips/navigationTipIds';
import {
  markNavigationTipDismissed,
  wasNavigationTipDismissed,
} from '@/navigationTips/navigationTipsPersistence';

export function useNavigationTip(tipId: NavigationTipId, eligible: boolean) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!eligible) {
      setVisible(false);
      return;
    }
    let cancelled = false;
    void wasNavigationTipDismissed(tipId).then((dismissed) => {
      if (!cancelled && !dismissed) setVisible(true);
    });
    return () => {
      cancelled = true;
    };
  }, [eligible, tipId]);

  const dismiss = useCallback(() => {
    setVisible(false);
    void markNavigationTipDismissed(tipId);
  }, [tipId]);

  const dismissIfLearned = useCallback(() => {
    setVisible(false);
    void markNavigationTipDismissed(tipId);
  }, [tipId]);

  return { visible, dismiss, dismissIfLearned };
}
