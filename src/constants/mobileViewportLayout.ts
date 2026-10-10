import { Platform } from 'react-native';

import { isAuthCompactViewport } from '@/constants/authViewportLayoutCore';

/** Use dynamic viewport + scroll on compact mobile web to avoid clipping CTAs. */
export function shouldUseMobileWebScrollShell(layoutHeight: number): boolean {
  return Platform.OS === 'web' && isAuthCompactViewport(layoutHeight);
}
