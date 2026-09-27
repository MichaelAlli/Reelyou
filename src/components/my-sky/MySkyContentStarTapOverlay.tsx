import { memo, useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import type { MySkyViewportSnapshot } from '@/mySky/mySkyViewportSession';
import type { MySkyStarDisplay } from '@/mySky/types';
import { mySkyWorldPointToScreen } from '@/spatialFocus/spatialFocusGeometry';

const HIT_RADIUS = 22;

interface MySkyContentStarTapOverlayProps {
  stars: MySkyStarDisplay[];
  layoutWidth: number;
  layoutHeight: number;
  worldWidth: number;
  worldHeight: number;
  viewport: MySkyViewportSnapshot;
  originLeft: number;
  originTop: number;
  accessibilityLabel: (star: MySkyStarDisplay) => string;
  onStarPress: (star: MySkyStarDisplay) => void;
}

/** Screen-space tap targets — sits above pan/zoom so presses are not swallowed by gestures. */
function MySkyContentStarTapOverlayComponent({
  stars,
  layoutWidth,
  layoutHeight,
  worldWidth,
  worldHeight,
  viewport,
  originLeft,
  originTop,
  accessibilityLabel,
  onStarPress,
}: MySkyContentStarTapOverlayProps) {
  const positioned = useMemo(() => {
    if (layoutWidth <= 0 || layoutHeight <= 0 || worldWidth <= 0 || worldHeight <= 0) {
      return [];
    }
    return stars
      .filter((star) => !star.isIdentityStar)
      .map((star) => {
        const { centerX, centerY } = mySkyWorldPointToScreen(
          star.x,
          star.y,
          worldWidth,
          worldHeight,
          viewport,
          originLeft,
          originTop,
        );
        return { star, centerX, centerY };
      });
  }, [
    layoutHeight,
    layoutWidth,
    originLeft,
    originTop,
    stars,
    viewport,
    worldHeight,
    worldWidth,
  ]);

  if (positioned.length === 0) return null;

  return (
    <View style={styles.layer} pointerEvents="box-none">
      {positioned.map(({ star, centerX, centerY }) => (
        <Pressable
          key={star.id}
          accessibilityRole="button"
          accessibilityLabel={accessibilityLabel(star)}
          onPress={() => onStarPress(star)}
          style={[
            styles.hit,
            {
              left: centerX - HIT_RADIUS,
              top: centerY - HIT_RADIUS,
            },
          ]}>
          <View style={styles.hitFill} />
        </Pressable>
      ))}
    </View>
  );
}

export const MySkyContentStarTapOverlay = memo(MySkyContentStarTapOverlayComponent);

const styles = StyleSheet.create({
  layer: {
    ...StyleSheet.absoluteFill,
    zIndex: 28,
  },
  hit: {
    position: 'absolute',
    width: HIT_RADIUS * 2,
    height: HIT_RADIUS * 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hitFill: {
    width: HIT_RADIUS * 2,
    height: HIT_RADIUS * 2,
    borderRadius: HIT_RADIUS,
    opacity: 0.01,
  },
});
