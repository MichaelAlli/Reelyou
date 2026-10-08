import { Platform, type ViewStyle } from 'react-native';

export {
  AUTH_COMPACT_VIEWPORT_MAX_HEIGHT,
  AUTH_VIEWPORT_WIDTH_FALLBACK,
  isAuthCompactViewport,
  resolveAuthAvailableContentWidth,
  resolveAuthTopInset,
} from '@/constants/authViewportLayoutCore';

import { authScrollBottomPadding as scrollBottomPaddingCore } from '@/constants/authViewportLayoutCore';

/** Web/mobile Safari-friendly full viewport — avoids clipping under browser chrome. */
export function authWebViewportStyle(): ViewStyle | undefined {
  if (Platform.OS !== 'web') {
    return undefined;
  }

  return {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100vw',
    minHeight: '100vh',
    height: '100dvh',
    maxHeight: '100dvh',
    overflow: 'hidden',
  } as unknown as ViewStyle;
}

export function authWebRootFillStyle(): ViewStyle | undefined {
  if (Platform.OS !== 'web') {
    return undefined;
  }

  return {
    flex: 1,
    minHeight: '100vh',
    height: '100%',
    maxHeight: '100dvh',
  } as unknown as ViewStyle;
}

export function authScrollBottomPadding(bottomInset: number, extra: number): number {
  const webChrome = Platform.OS === 'web' ? 12 : 0;
  return scrollBottomPaddingCore(bottomInset, extra, webChrome);
}
