import { useCallback, useRef } from 'react';
import type { NativeScrollEvent, NativeSyntheticEvent, ScrollView } from 'react-native';

import type { StarPathLayoutMetrics } from '@/starpath/starpathLayoutMetrics';
import { refPointToWorldPx } from '@/starpath/starpathLayoutMetrics';
import type { LayoutPoint } from '@/starpath/starpathReferenceLayout';

export function useStarPathScrollCamera(metrics: StarPathLayoutMetrics, viewportHeight: number) {
  const scrollRef = useRef<ScrollView>(null);
  const scrollYRef = useRef(metrics.initialScrollY);

  const onScroll = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
    scrollYRef.current = e.nativeEvent.contentOffset.y;
  }, []);

  const scrollToRefPoint = useCallback(
    (point: LayoutPoint, animated = true) => {
      const { y: worldY } = refPointToWorldPx(point, metrics);
      const targetY = Math.max(
        0,
        Math.min(worldY - viewportHeight * 0.38, metrics.worldHeight - viewportHeight),
      );
      scrollRef.current?.scrollTo({ y: targetY, animated });
    },
    [metrics, viewportHeight],
  );

  const scrollToWorldY = useCallback(
    (worldY: number, animated = true) => {
      const targetY = Math.max(
        0,
        Math.min(worldY - viewportHeight * 0.35, metrics.worldHeight - viewportHeight),
      );
      scrollRef.current?.scrollTo({ y: targetY, animated });
    },
    [metrics, viewportHeight],
  );

  const restoreInitialViewport = useCallback(
    (animated = false) => {
      scrollRef.current?.scrollTo({ y: metrics.initialScrollY, animated });
    },
    [metrics.initialScrollY],
  );

  return {
    scrollRef,
    scrollYRef,
    onScroll,
    scrollToRefPoint,
    scrollToWorldY,
    restoreInitialViewport,
  };
}
