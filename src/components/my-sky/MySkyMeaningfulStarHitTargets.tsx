import { memo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { MySkyVisibilityBadge } from '@/components/my-sky/MySkyVisibilityBadge';
import type { MySkyStarDisplay } from '@/mySky/types';
import type { SkyVisibilityLevel } from '@/mySky/skyVisibilitySettings';

interface MySkyMeaningfulStarHitTargetsProps {
  stars: MySkyStarDisplay[];
  visitorMode?: boolean;
  onStarPress: (star: MySkyStarDisplay) => void;
  accessibilityLabel: (star: MySkyStarDisplay) => string;
}

/** Transparent press targets only — no star visuals (see MySkyRenderer / MySkyIdentityStar). */
function MySkyMeaningfulStarHitTargetsComponent({
  stars,
  visitorMode = false,
  onStarPress,
  accessibilityLabel,
}: MySkyMeaningfulStarHitTargetsProps) {
  return (
    <View style={styles.layer} pointerEvents="box-none">
      {stars.map((star) => (
        <Pressable
          key={star.id}
          accessibilityRole="button"
          accessibilityLabel={accessibilityLabel(star)}
          hitSlop={6}
          onPress={() => onStarPress(star)}
          style={[
            styles.hit,
            {
              left: `${star.x * 100}%`,
              top: `${star.y * 100}%`,
            },
          ]}>
          <View style={styles.hitTarget} />
          {!visitorMode && (star.visibility === 'private' || star.visibility === 'orbit') ? (
            <MySkyVisibilityBadge visibility={star.visibility as SkyVisibilityLevel} compact />
          ) : null}
        </Pressable>
      ))}
    </View>
  );
}

export const MySkyMeaningfulStarHitTargets = memo(MySkyMeaningfulStarHitTargetsComponent);

const styles = StyleSheet.create({
  layer: {
    ...StyleSheet.absoluteFill,
    zIndex: 16,
  },
  hit: {
    position: 'absolute',
    width: 44,
    height: 44,
    marginLeft: -22,
    marginTop: -22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hitTarget: {
    width: 44,
    height: 44,
    borderRadius: 22,
    opacity: 0.01,
  },
});
