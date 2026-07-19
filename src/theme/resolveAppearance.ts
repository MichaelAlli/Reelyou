import type { ColorSchemeName } from 'react-native';

import type { ResolvedAppearance, ThemeMode } from './types';
import { resolveTimeOfDayAppearance } from './timeOfDay';

export function resolveAppearance(
  mode: ThemeMode,
  systemScheme: ColorSchemeName | null | undefined,
  now: Date,
): ResolvedAppearance {
  switch (mode) {
    case 'light':
      return 'light';
    case 'dark':
      return 'dark';
    case 'system':
      return systemScheme === 'light' ? 'light' : 'dark';
    case 'timeOfDay':
      return resolveTimeOfDayAppearance(now);
    default:
      return 'dark';
  }
}
