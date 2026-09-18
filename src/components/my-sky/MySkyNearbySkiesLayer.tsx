import { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { MySkyIdentityStar } from '@/components/my-sky/MySkyIdentityStar';
import type { NearbySkyAnchor } from '@/mySky/buildNearbySkies';
import type { MySkyStarDisplay } from '@/mySky/types';

interface MySkyNearbySkiesLayerProps {
  anchors: NearbySkyAnchor[];
  worldWidth: number;
  worldHeight: number;
  activeOwnerId?: string | null;
  proximityOwnerId?: string | null;
  proximityPhase?: 'none' | 'nearby' | 'entering';
  onIdentityPress: (anchor: NearbySkyAnchor) => void;
}

function MySkyNearbySkiesLayerComponent({
  anchors,
  worldWidth,
  worldHeight,
  activeOwnerId = null,
  proximityOwnerId = null,
  proximityPhase = 'none',
  onIdentityPress,
}: MySkyNearbySkiesLayerProps) {
  if (worldWidth <= 0 || worldHeight <= 0) return null;

  return (
    <View style={styles.root} pointerEvents="box-none">
      <Svg width={worldWidth} height={worldHeight} pointerEvents="none">
        {anchors.map((anchor) => {
          const isExplore = anchor.tier === 'explore';
          const isProximity =
            proximityOwnerId === anchor.ownerId && proximityPhase !== 'none';
          const cx = anchor.x * worldWidth;
          const cy = anchor.y * worldHeight;
          const radius = isExplore ? 34 : 42;
          const opacity = isExplore ? 0.14 : 0.22;

          return (
            <Circle
              key={`region-${anchor.id}`}
              cx={cx}
              cy={cy}
              r={radius + (isProximity ? 8 : 0)}
              fill={
                isProximity
                  ? `rgba(255, 213, 122, ${proximityPhase === 'entering' ? 0.16 : 0.1})`
                  : `rgba(167, 139, 250, ${opacity})`
              }
              stroke={
                isProximity ? 'rgba(255, 213, 122, 0.35)' : 'rgba(167, 139, 250, 0.18)'
              }
              strokeWidth={isProximity ? 1.2 : 0.8}
            />
          );
        })}
      </Svg>

      {anchors.map((anchor) => (
        <MySkyIdentityStar
          key={anchor.identityStar.id}
          star={anchor.identityStar}
          worldWidth={worldWidth}
          worldHeight={worldHeight}
          active={activeOwnerId === anchor.ownerId}
          prominence={anchor.tier === 'explore' ? 0.92 : 1.04}
          onPress={() => onIdentityPress(anchor)}
        />
      ))}
    </View>
  );
}

export const MySkyNearbySkiesLayer = memo(MySkyNearbySkiesLayerComponent);

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFill,
  },
});

export type { MySkyStarDisplay };
