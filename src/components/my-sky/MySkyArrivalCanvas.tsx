import { memo, useCallback, useEffect, useState } from 'react';
import { LayoutChangeEvent, StyleSheet, View } from 'react-native';
import {
  Easing,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { StarPulse } from '@/components/celestial';
import { CelestialArrivalMotion, CelestialStarBreathMotion } from '@/constants/celestialMotion';
import { MySkyConstellationLayer } from '@/components/my-sky/MySkyConstellationLayer';
import type { SkyNode, SkyRelationship } from '@/mySky/skyNodeTypes';
import type { MySkyVisibleLayers } from '@/mySky/skyLayers';
import type { MySkyStarDisplay } from '@/mySky/types';

interface MySkyArrivalCanvasProps {
  stars: MySkyStarDisplay[];
  highlightStarId: string | null;
  vitality?: number;
  patternRelationships?: SkyRelationship[];
  patternNodes?: SkyNode[];
  visibleLayers?: MySkyVisibleLayers;
  /** When false, trail starts hidden (resting state). */
  animateArrival?: boolean;
}

function MySkyArrivalCanvasComponent({
  stars,
  highlightStarId,
  vitality = 1,
  patternRelationships = [],
  patternNodes = [],
  visibleLayers,
  animateArrival = true,
}: MySkyArrivalCanvasProps) {
  const [size, setSize] = useState({ w: 320, h: 480 });

  const trailOpacity = useSharedValue(animateArrival ? 1 : 0);
  const linksOpacity = useSharedValue(animateArrival ? CelestialArrivalMotion.linksInitialOpacity : 0);
  const starBreath = useSharedValue(0);

  useEffect(() => {
    if (!animateArrival) {
      starBreath.value = withRepeat(
        withSequence(
          withTiming(1, { duration: CelestialStarBreathMotion.durationMs }),
          withTiming(0, { duration: CelestialStarBreathMotion.durationMs }),
        ),
        -1,
        false,
      );
      return;
    }

    trailOpacity.value = withDelay(
      CelestialArrivalMotion.trailFadeDelayMs,
      withTiming(0, { duration: CelestialArrivalMotion.trailFadeDurationMs, easing: Easing.out(Easing.cubic) }),
    );
    linksOpacity.value = withSequence(
      withTiming(CelestialArrivalMotion.linksInitialOpacity, { duration: CelestialArrivalMotion.linksRevealDurationMs }),
      withDelay(
        CelestialArrivalMotion.linksFadeDelayMs,
        withTiming(0, { duration: CelestialArrivalMotion.linksFadeDurationMs, easing: Easing.out(Easing.quad) }),
      ),
    );
    starBreath.value = withDelay(
      CelestialArrivalMotion.starBreathDelayMs,
      withRepeat(
        withSequence(
          withTiming(1, { duration: CelestialStarBreathMotion.durationMs }),
          withTiming(0, { duration: CelestialStarBreathMotion.durationMs }),
        ),
        -1,
        false,
      ),
    );
  }, [animateArrival, linksOpacity, starBreath, trailOpacity]);

  const onLayout = useCallback((e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    if (width > 0 && height > 0) setSize({ w: width, h: height });
  }, []);

  const highlight = stars.find((s) => s.id === highlightStarId) ?? null;

  return (
    <View style={styles.wrap} onLayout={onLayout}>
      <MySkyConstellationLayer
        width={size.w}
        height={size.h}
        userStars={stars}
        highlightStarId={highlightStarId}
        trailOpacity={trailOpacity}
        linksOpacity={linksOpacity}
        starBreath={starBreath}
        vitality={vitality}
        patternRelationships={patternRelationships}
        patternNodes={patternNodes}
        visibleLayers={visibleLayers}
      />
      {highlight ? (
        <StarPulse cx={highlight.x * size.w} cy={highlight.y * size.h} />
      ) : null}
    </View>
  );
}

export const MySkyArrivalCanvas = memo(MySkyArrivalCanvasComponent);

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    overflow: 'hidden',
  },
});
