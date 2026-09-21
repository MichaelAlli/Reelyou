import { memo, useCallback, useState } from 'react';
import { LayoutChangeEvent, StyleSheet, View } from 'react-native';

import { MySkyArrivalCanvas } from '@/components/my-sky/MySkyArrivalCanvas';
import { MySkyLivingSkyLayer } from '@/components/my-sky/MySkyLivingSkyLayer';
import type { MySkyStarDisplay, MySkyView } from '@/mySky/types';

export type MySkyRenderMode = 'resting' | 'arrival';

interface MySkyRendererProps {
  /** Centralized My Sky view projection — stars derived from nodes, not hard-coded JSX. */
  view: Pick<MySkyView, 'stars' | 'vitality' | 'relationships' | 'nodes' | 'patterns' | 'viewState'>;
  mode?: MySkyRenderMode;
  highlightStarId?: string | null;
  /** Arrival trail / link reveal — false once settled. */
  animateArrival?: boolean;
  /** User-triggered temporary constellation reveal count. */
  constellationRevealCount?: number;
  constellationRevealActive?: boolean;
  revealPatternId?: string | null;
  onConstellationRevealComplete?: () => void;
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
  constellationRevealCount = 0,
  constellationRevealActive = false,
  revealPatternId = null,
  onConstellationRevealComplete,
}: MySkyRendererProps) {
  const { stars, vitality, relationships, nodes, patterns, viewState } = view;
  const [size, setSize] = useState({ w: 320, h: 360 });

  const onLayout = useCallback((e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    if (width > 0 && height > 0) {
      setSize({ w: width, h: height });
    }
  }, []);

  return (
    <View style={styles.wrap} onLayout={onLayout} pointerEvents="none">
      {mode === 'arrival' || animateArrival ? (
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
          highlightStarId={highlightStarId}
          vitality={vitality}
          patternRelationships={relationships}
          patternNodes={nodes}
          patterns={patterns}
          visibleLayers={viewState.visibleLayers}
          constellationRevealCount={constellationRevealCount}
          constellationRevealActive={constellationRevealActive}
          revealPatternId={revealPatternId}
          onRevealComplete={onConstellationRevealComplete}
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
