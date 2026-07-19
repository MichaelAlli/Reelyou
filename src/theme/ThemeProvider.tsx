import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { Appearance, AppState, type ColorSchemeName } from 'react-native';

import { loadThemeMode, saveThemeMode } from './persistence';
import { resolveAppearance } from './resolveAppearance';
import { getThemeTokens } from './tokens';
import { defaultTimeSource, getMsUntilNextTimeBoundary } from './timeOfDay';
import type { ResolvedAppearance, ThemeContextValue, ThemeMode } from './types';

const ThemeContext = createContext<ThemeContextValue | null>(null);

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [themeMode, setThemeModeState] = useState<ThemeMode>('system');
  const [systemScheme, setSystemScheme] = useState<ColorSchemeName | null>(() =>
    Appearance.getColorScheme() ?? null,
  );
  const [isReady, setIsReady] = useState(false);
  const [timeOverride, setTimeOverride] = useState<Date | null>(null);
  const [nowTick, setNowTick] = useState(0);

  const timeSourceRef = useRef(defaultTimeSource);

  const getNow = useCallback((): Date => {
    return timeOverride ?? timeSourceRef.current();
  }, [timeOverride]);

  useEffect(() => {
    let mounted = true;

    loadThemeMode().then((mode) => {
      if (mounted) {
        setThemeModeState(mode);
        setIsReady(true);
      }
    });

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setSystemScheme(colorScheme);
    });

    return () => subscription.remove();
  }, []);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        setNowTick((tick) => tick + 1);
      }
    });

    return () => subscription.remove();
  }, []);

  useEffect(() => {
    if (themeMode !== 'timeOfDay' || timeOverride != null) {
      return;
    }

    const scheduleNextBoundary = () => {
      const delay = getMsUntilNextTimeBoundary(getNow());
      return setTimeout(() => {
        setNowTick((tick) => tick + 1);
      }, delay);
    };

    let timeout = scheduleNextBoundary();

    return () => clearTimeout(timeout);
  }, [themeMode, timeOverride, getNow, nowTick]);

  const setThemeMode = useCallback((mode: ThemeMode) => {
    setThemeModeState(mode);
    void saveThemeMode(mode);
  }, []);

  const resolvedAppearance: ResolvedAppearance = useMemo(() => {
    void nowTick;
    return resolveAppearance(themeMode, systemScheme, getNow());
  }, [themeMode, systemScheme, getNow, nowTick]);

  const tokens = useMemo(() => getThemeTokens(resolvedAppearance), [resolvedAppearance]);

  const value = useMemo<ThemeContextValue>(
    () => ({
      themeMode,
      resolvedAppearance,
      tokens,
      isReady,
      setThemeMode,
      setTimeOverride,
    }),
    [themeMode, resolvedAppearance, tokens, isReady, setThemeMode],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useThemeContext(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (context == null) {
    throw new Error('useThemeContext must be used within ThemeProvider');
  }
  return context;
}
