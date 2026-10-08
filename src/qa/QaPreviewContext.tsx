import { useGlobalSearchParams } from 'expo-router';
import { createContext, useContext, useMemo, type ReactNode } from 'react';

import { isQaPreviewQueryActive } from '@/config/qaPreviewFlags';

export interface QaPreviewContextValue {
  /** QA preview query param is active and access is allowed. */
  active: boolean;
  /** Block production writes / side effects on this screen. */
  readOnly: boolean;
  qaState: 'empty' | 'loading' | 'error' | 'populated' | null;
}

const QaPreviewContext = createContext<QaPreviewContextValue>({
  active: false,
  readOnly: false,
  qaState: null,
});

export function QaPreviewProvider({ children }: { children: ReactNode }) {
  const params = useGlobalSearchParams<{ qaPreview?: string; qaState?: string }>();

  const value = useMemo((): QaPreviewContextValue => {
    const active = isQaPreviewQueryActive(
      typeof params.qaPreview === 'string' ? params.qaPreview : undefined,
    );
    const rawState = params.qaState;
    const qaState =
      rawState === 'empty' || rawState === 'loading' || rawState === 'error' || rawState === 'populated'
        ? rawState
        : null;

    return {
      active,
      readOnly: active,
      qaState,
    };
  }, [params.qaPreview, params.qaState]);

  return <QaPreviewContext.Provider value={value}>{children}</QaPreviewContext.Provider>;
}

export function useQaPreviewMode(): QaPreviewContextValue {
  return useContext(QaPreviewContext);
}
