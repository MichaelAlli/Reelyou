import { useMemo } from 'react';
import { StyleSheet, type ImageStyle, type TextStyle, type ViewStyle } from 'react-native';

import { useThemeContext } from './ThemeProvider';
import type { ThemeTokens } from './types';

type NamedStyles<T> = {
  [P in keyof T]: ViewStyle | TextStyle | ImageStyle;
};

export function useTheme() {
  const { tokens, themeMode, resolvedAppearance, isReady, setThemeMode, setTimeOverride, setDevAppearanceOverride, clearDevAppearanceOverride } =
    useThemeContext();

  return {
    tokens,
    themeMode,
    resolvedAppearance,
    isReady,
    setThemeMode,
    setTimeOverride,
    setDevAppearanceOverride: setDevAppearanceOverride ?? undefined,
    clearDevAppearanceOverride: clearDevAppearanceOverride ?? undefined,
    isDark: resolvedAppearance === 'dark',
    isLight: resolvedAppearance === 'light',
  };
}

export function useThemedStyles<T extends NamedStyles<T>>(factory: (tokens: ThemeTokens) => T): T {
  const { tokens } = useTheme();
  return useMemo(() => StyleSheet.create(factory(tokens)), [tokens]);
}
