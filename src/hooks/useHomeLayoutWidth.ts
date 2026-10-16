import { useEffect, useState } from 'react';
import { Platform, useWindowDimensions } from 'react-native';

/**
 * Layout width for Home — on mobile web, clamp to visualViewport so RN layout
 * does not oversize when the layout viewport is wider than the visible screen.
 */
export function useHomeLayoutWidth(): number {
  const { width: layoutWidth } = useWindowDimensions();
  const [visualWidth, setVisualWidth] = useState<number | null>(null);

  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') {
      setVisualWidth(null);
      return;
    }
    const vv = window.visualViewport;
    const sync = () => {
      const next = vv?.width ?? window.innerWidth;
      setVisualWidth(Number.isFinite(next) && next > 0 ? next : null);
    };
    sync();
    vv?.addEventListener('resize', sync);
    vv?.addEventListener('scroll', sync);
    window.addEventListener('resize', sync);
    return () => {
      vv?.removeEventListener('resize', sync);
      vv?.removeEventListener('scroll', sync);
      window.removeEventListener('resize', sync);
    };
  }, [layoutWidth]);

  if (Platform.OS !== 'web' || visualWidth == null) {
    return layoutWidth;
  }
  return Math.min(layoutWidth, visualWidth);
}
