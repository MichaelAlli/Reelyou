import { memo, useEffect } from 'react';
import { StyleSheet, Text } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { MySkyCopy } from '@/constants/mySkyCopy';
import { Fonts, Radius } from '@/constants/theme';
import type { SkyProximityPhase } from '@/mySky/skyProximity';
import { useThemedStyles } from '@/theme/useTheme';

interface MySkyOwnerNameCueProps {
  ownerName: string;
  x: number;
  y: number;
  worldWidth: number;
  worldHeight: number;
  phase: SkyProximityPhase;
  visible: boolean;
}

/** Soft owner-name fade near a nearby identity star. */
function MySkyOwnerNameCueComponent({
  ownerName,
  x,
  y,
  worldWidth,
  worldHeight,
  phase,
  visible,
}: MySkyOwnerNameCueProps) {
  const opacity = useSharedValue(0);

  useEffect(() => {
    const target =
      visible && (phase === 'entering' || phase === 'entered') ? 1 : 0;
    opacity.value = withTiming(target, { duration: 320 });
  }, [opacity, phase, visible]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const styles = useThemedStyles((tokens) =>
    StyleSheet.create({
      label: {
        position: 'absolute',
        left: x * worldWidth - 52,
        top: y * worldHeight + 22,
        width: 104,
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: Radius.full,
        backgroundColor: 'rgba(8, 8, 24, 0.62)',
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: 'rgba(255, 213, 122, 0.22)',
      },
      text: {
        fontFamily: Fonts.sans,
        fontSize: 10,
        fontWeight: '600',
        color: tokens.gold,
        textAlign: 'center',
      },
    }),
  );

  if (!visible || phase === 'none' || phase === 'nearby') return null;

  const label = MySkyCopy.ownerSkyLabel.replace('{name}', ownerName);

  return (
    <Animated.View style={[styles.label, animatedStyle]} pointerEvents="none">
      <Text style={styles.text} numberOfLines={1}>
        {label}
      </Text>
    </Animated.View>
  );
}

export const MySkyOwnerNameCue = memo(MySkyOwnerNameCueComponent);
