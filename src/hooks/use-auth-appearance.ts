import { useSegments } from 'expo-router';

import { useTheme } from '@/theme';

/**
 * Resolves auth UI appearance. The /signup route always uses the approved daytime design.
 */
export function useAuthAppearance(): boolean {
  const { isLight } = useTheme();
  const segments = useSegments();
  const onSignUpRoute = segments.some((segment) => segment === 'signup');

  if (onSignUpRoute) {
    return true;
  }

  return isLight;
}
