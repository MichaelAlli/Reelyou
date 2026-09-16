import { memo, useCallback, useEffect, useState } from 'react';
import { LayoutChangeEvent, StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

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

function HighlightPulse({
  size,
  star,
}: {
  size: { w: number; h: number };
  star: MySkyStarDisplay;
}) {
  const pulse = useSharedValue(0.55);

  useEffect(() => {
    pulse.value = withSequence(
      withRepeat(
        withSequence(withTiming(1, { duration: 1100 }), withTiming(0.5, { duration: 1100 })),
        3,
        false,
      ),
      withRepeat(
        withSequence(withTiming(0.82, { duration: 2200 }), withTiming(0.58, { duration: 2200 })),
        -1,
        false,
      ),
    );
  }, [pulse]);

  const style = useAnimatedStyle(() => ({
    opacity: pulse.value,
    transform: [{ scale: 0.9 + pulse.value * 0.18 }],
  }));

  return (
    <Animated.View
      style={[
        styles.pulseRing,
        style,
        {
          left: star.x * size.w - 36,
          top: star.y * size.h - 36,
        },
      ]}
      pointerEvents="none"
      accessibilityElementsHidden
    />
  );
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
  const linksOpacity = useSharedValue(animateArrival ? 0.68 : 0);
  const starBreath = useSharedValue(0);

  useEffect(() => {
    if (!animateArrival) {
      starBreath.value = withRepeat(
        withSequence(withTiming(1, { duration: 3200 }), withTiming(0, { duration: 3200 })),
        -1,
        false,
      );
      return;
    }

    trailOpacity.value = withDelay(
      600,
      withTiming(0, { duration: 1400, easing: Easing.out(Easing.cubic) }),
    );
    linksOpacity.value = withSequence(
      withTiming(0.68, { duration: 500 }),
      withDelay(1200, withTiming(0, { duration: 1600, easing: Easing.out(Easing.quad) })),
    );
    starBreath.value = withDelay(
      800,
      withRepeat(
        withSequence(withTiming(1, { duration: 3200 }), withTiming(0, { duration: 3200 })),
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
      {highlight ? <HighlightPulse size={size} star={highlight} /> : null}
    </View>
  );
}

export const MySkyArrivalCanvas = memo(MySkyArrivalCanvasComponent);

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    overflow: 'hidden',
  },
  pulseRing: {
    position: 'absolute',
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 2,
    borderColor: 'rgba(255, 213, 122, 0.55)',
    backgroundColor: 'rgba(255, 213, 122, 0.08)',
  },
});
