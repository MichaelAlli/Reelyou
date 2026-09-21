import { memo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Svg from 'react-native-svg';

import { ApprovedReelyouStar } from '@/components/celestial/ApprovedReelyouStar';
import { CelestialStarGeometry } from '@/constants/celestialTokens';
import type { MySkyStarDisplay } from '@/mySky/types';

interface MySkyIdentityStarProps {
  star: MySkyStarDisplay;
  worldWidth: number;
  worldHeight: number;
  active?: boolean;
  prominence?: number;
  onPress: () => void;
}

/** Owner anchor — approved PremiumStar language with subtle emphasis. */
function MySkyIdentityStarComponent({
  star,
  worldWidth,
  worldHeight,
  active = false,
  prominence = 1,
  onPress,
}: MySkyIdentityStarProps) {
  const baseSize = (star.visualSize ?? CelestialStarGeometry.defaultUserStarSize + 1.4) * prominence;
  const intensity = (star.visualBrightness ?? 1.05) * (active ? 1.1 : prominence > 1.05 ? 1.04 : 1);
  const svgSize = baseSize * 5.2;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${star.title ?? 'Sky owner'}. Open profile.`}
      onPress={onPress}
      style={[
        styles.hit,
        { left: star.x * worldWidth, top: star.y * worldHeight },
        active && styles.hitActive,
      ]}>
      <View pointerEvents="none" style={styles.starWrap}>
        <Svg width={svgSize} height={svgSize}>
          <ApprovedReelyouStar
            id={`identity-${star.id}`}
            cx={svgSize / 2}
            cy={svgSize / 2}
            size={baseSize * (active ? 1.06 : 1)}
            color={star.color}
            role="focal"
            intensity={intensity}
          />
        </Svg>
      </View>
    </Pressable>
  );
}

export const MySkyIdentityStar = memo(MySkyIdentityStarComponent);

const styles = StyleSheet.create({
  hit: {
    position: 'absolute',
    width: 64,
    height: 64,
    marginLeft: -32,
    marginTop: -32,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 13,
  },
  hitActive: {
    transform: [{ scale: 1.03 }],
  },
  starWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
