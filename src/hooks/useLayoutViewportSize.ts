import { useEffect, useState } from 'react';
import { Platform, useWindowDimensions } from 'react-native';

export interface LayoutViewportSize {
  /** Layout viewport width from React Native. */
  width: number;
  /** Layout viewport height from React Native (`useWindowDimensions`). */
  layoutHeight: number;
  /**
   * Height available for composing foreground UI — on mobile web uses
   * `visualViewport` when smaller than the layout height (Safari toolbars).
   */
  effectiveHeight: number;
  /** Visual viewport offset from top of layout viewport (mobile web). */
  visualOffsetTop: number;
}

/**
 * Combines RN window dimensions with the visual viewport on web so full-screen
 * auth/welcome layouts fit above mobile browser chrome.
 */
export function useLayoutViewportSize(): LayoutViewportSize {
  const { width, height: layoutHeight } = useWindowDimensions();
  const [visual, setVisual] = useState({ height: layoutHeight, offsetTop: 0 });

  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') {
      return;
    }
    const vv = window.visualViewport;
    if (!vv) {
      return;
    }

    const sync = () => {
      setVisual({
        height: vv.height,
        offsetTop: vv.offsetTop,
      });
    };

    sync();
    vv.addEventListener('resize', sync);
    vv.addEventListener('scroll', sync);
    return () => {
      vv.removeEventListener('resize', sync);
      vv.removeEventListener('scroll', sync);
    };
  }, [layoutHeight]);

  const effectiveHeight =
    Platform.OS === 'web' && visual.height > 0
      ? Math.min(layoutHeight, visual.height)
      : layoutHeight;

  return {
    width,
    layoutHeight,
    effectiveHeight,
    visualOffsetTop: Platform.OS === 'web' ? visual.offsetTop : 0,
  };
}
