import { memo, useCallback, useState } from 'react';
import { LayoutChangeEvent, StyleSheet, View } from 'react-native';

import { MySkyArrivalCanvas } from '@/components/my-sky/MySkyArrivalCanvas';
import { MySkyLivingSkyLayer } from '@/components/my-sky/MySkyLivingSkyLayer';
import type { MySkyStarDisplay, MySkyView } from '@/mySky/types';

export type MySkyRenderMode = 'resting' | 'arrival';

interface MySkyRendererProps {
  /** Centralized My Sky view projection — stars derived from nodes, not hard-coded JSX. */
  view: Pick<MySkyView, 'stars' | 'vitality' | 'relationships' | 'nodes' | 'viewState'>;
  mode?: MySkyRenderMode;
  highlightStarId?: string | null;
  /** Arrival trail / link reveal — false once settled. */
  animateArrival?: boolean;
  /** Brief ambient link reveal on mount (resting tab preview). */
  revealLinks?: boolean;
}

/**
 * Reusable My Sky star-field renderer — projects centralized nodes to approved visuals.
 * Decorative backdrop constellations remain in MySkyConstellationLayer (ambient art).
 */
function MySkyRendererComponent({
  view,
  mode = 'resting',
  highlightStarId = null,
  animateArrival = false,
  revealLinks = true,
}: MySkyRendererProps) {
  const { stars, vitality, relationships, nodes, viewState } = view;
  const [size, setSize] = useState({ w: 320, h: 360 });

  const onLayout = useCallback((e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    if (width > 0 && height > 0) {
      setSize({ w: width, h: height });
    }
  }, []);

  return (
    <View style={styles.wrap} onLayout={onLayout}>
      {mode === 'arrival' || animateArrival || highlightStarId ? (
        <MySkyArrivalCanvas
          stars={stars}
          highlightStarId={highlightStarId}
          vitality={vitality}
          patternRelationships={relationships}
          patternNodes={nodes}
          visibleLayers={viewState.visibleLayers}
          animateArrival={animateArrival}
        />
      ) : (
        <MySkyLivingSkyLayer
          width={size.w}
          height={size.h}
          userStars={stars}
          vitality={vitality}
          patternRelationships={relationships}
          patternNodes={nodes}
          visibleLayers={viewState.visibleLayers}
          revealLinks={revealLinks}
        />
      )}
    </View>
  );
}

export const MySkyRenderer = memo(MySkyRendererComponent);

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    overflow: 'hidden',
  },
});

export type { MySkyStarDisplay };
