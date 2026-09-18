import { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { MySkyIdentityStar } from '@/components/my-sky/MySkyIdentityStar';
import { MySkyOwnerNameCue } from '@/components/my-sky/MySkyOwnerNameCue';
import { prominenceForTier, type NearbySkyAnchor } from '@/mySky/buildNearbySkies';
import type { SkyProximityPhase } from '@/mySky/skyProximity';

interface MySkyNearbySkiesLayerProps {
  anchors: NearbySkyAnchor[];
  worldWidth: number;
  worldHeight: number;
  activeOwnerId?: string | null;
  proximityOwnerId?: string | null;
  proximityPhase?: SkyProximityPhase;
  highlightOwnerId?: string | null;
  onIdentityPress: (anchor: NearbySkyAnchor) => void;
}

function prominenceBoost(phase: SkyProximityPhase, isProximity: boolean): number {
  if (!isProximity) return 1;
  if (phase === 'entered') return 1.12;
  if (phase === 'entering') return 1.06;
  if (phase === 'nearby') return 1.02;
  return 1;
}

function MySkyNearbySkiesLayerComponent({
  anchors,
  worldWidth,
  worldHeight,
  activeOwnerId = null,
  proximityOwnerId = null,
  proximityPhase = 'none',
  highlightOwnerId = null,
  onIdentityPress,
}: MySkyNearbySkiesLayerProps) {
  if (worldWidth <= 0 || worldHeight <= 0) return null;

  return (
    <View style={styles.root} pointerEvents="box-none">
      <Svg width={worldWidth} height={worldHeight} pointerEvents="none">
        {anchors.map((anchor) => {
          const isExplore = anchor.tier === 'explore';
          const isSharedCommunity = anchor.tier === 'shared-community';
          const isHighlighted = highlightOwnerId === anchor.ownerId;
          const isProximity =
            (proximityOwnerId === anchor.ownerId && proximityPhase !== 'none') || isHighlighted;
          const cx = anchor.x * worldWidth;
          const cy = anchor.y * worldHeight;
          const baseRadius = isExplore ? 30 : isSharedCommunity ? 38 : 42;
          const radius =
            baseRadius +
            (isHighlighted ? 8 : isProximity ? (proximityPhase === 'entered' ? 10 : 6) : 0);
          const opacity = isExplore ? 0.12 : isSharedCommunity ? 0.18 : 0.22;

          return (
            <Circle
              key={`region-${anchor.id}`}
              cx={cx}
              cy={cy}
              r={radius}
              fill={
                isProximity
                  ? `rgba(255, 213, 122, ${
                      proximityPhase === 'entered' ? 0.18 : proximityPhase === 'entering' ? 0.14 : 0.1
                    })`
                  : `rgba(167, 139, 250, ${opacity})`
              }
              stroke={
                isProximity ? 'rgba(255, 213, 122, 0.38)' : 'rgba(167, 139, 250, 0.18)'
              }
              strokeWidth={isProximity ? 1.2 : 0.8}
            />
          );
        })}
      </Svg>

      {anchors.map((anchor) => {
        const isHighlighted = highlightOwnerId === anchor.ownerId;
        const isProximity =
          (proximityOwnerId === anchor.ownerId && proximityPhase !== 'none') || isHighlighted;
        const prominence =
          prominenceForTier(anchor.tier) *
          prominenceBoost(proximityPhase, isProximity) *
          (isHighlighted ? 1.08 : 1);

        return (
          <MySkyIdentityStar
            key={anchor.identityStar.id}
            star={anchor.identityStar}
            worldWidth={worldWidth}
            worldHeight={worldHeight}
            active={
              activeOwnerId === anchor.ownerId ||
              isHighlighted ||
              (isProximity && proximityPhase === 'entered')
            }
            prominence={prominence}
            onPress={() => onIdentityPress(anchor)}
          />
        );
      })}

      {anchors.map((anchor) => {
        const isProximity =
          proximityOwnerId === anchor.ownerId && proximityPhase !== 'none';

        return (
          <MySkyOwnerNameCue
            key={`owner-cue-${anchor.id}`}
            ownerName={anchor.owner.name}
            x={anchor.x}
            y={anchor.y}
            worldWidth={worldWidth}
            worldHeight={worldHeight}
            phase={proximityPhase}
            visible={isProximity}
          />
        );
      })}
    </View>
  );
}

export const MySkyNearbySkiesLayer = memo(MySkyNearbySkiesLayerComponent);

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFill,
  },
});
