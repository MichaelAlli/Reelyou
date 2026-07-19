/**
 * Legacy Expo template hook — returns light/dark color map from resolved appearance.
 * Prefer useTheme() from '@/theme/useTheme' for semantic tokens.
 */

import { Colors } from '@/constants/theme';
import { useTheme as useAppTheme } from '@/theme/useTheme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export function useTheme() {
  const { resolvedAppearance } = useAppTheme();
  const scheme = useColorScheme();
  const fallback = scheme === 'light' ? 'light' : 'dark';
  const theme = resolvedAppearance ?? fallback;

  return Colors[theme];
}
