import { createContext, createElement, useContext, type ReactNode } from 'react';

import { useTheme } from '@/theme';

const AuthAppearanceOverrideContext = createContext<boolean | null>(null);

interface AuthAppearanceProviderProps {
  isLight: boolean;
  children: ReactNode;
}

/** Forces auth component styling without changing global theme preferences. */
export function AuthAppearanceProvider({ isLight, children }: AuthAppearanceProviderProps) {
  return createElement(AuthAppearanceOverrideContext.Provider, { value: isLight }, children);
}

/**
 * Resolves auth UI appearance from the active theme (light = daytime, dark = nighttime).
 * Route-level overrides (e.g. Daytime Sign In fallback) take precedence.
 */
export function useAuthAppearance(): boolean {
  const override = useContext(AuthAppearanceOverrideContext);
  const { isLight } = useTheme();
  return override ?? isLight;
}
