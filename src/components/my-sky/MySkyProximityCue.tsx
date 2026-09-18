import { memo, useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { MySkyCopy } from '@/constants/mySkyCopy';
import { Fonts, Radius } from '@/constants/theme';
import type { NearbySkyAnchor } from '@/mySky/buildNearbySkies';
import type { SkyProximityPhase } from '@/mySky/skyProximity';
import { useThemedStyles } from '@/theme/useTheme';

interface MySkyProximityCueProps {
  anchor: NearbySkyAnchor | null;
  phase: SkyProximityPhase;
  onPress?: (anchor: NearbySkyAnchor) => void;
}

function MySkyProximityCueComponent({ anchor, phase, onPress }: MySkyProximityCueProps) {
  const opacity = useSharedValue(0);

  useEffect(() => {
    opacity.value = withTiming(anchor && phase !== 'none' ? 1 : 0, { duration: 280 });
  }, [anchor, opacity, phase]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const styles = useThemedStyles((tokens) =>
    StyleSheet.create({
      wrap: {
        position: 'absolute',
        top: 12,
        alignSelf: 'center',
        zIndex: 12,
      },
      pill: {
        paddingHorizontal: 14,
        paddingVertical: 7,
        borderRadius: Radius.full,
        backgroundColor: 'rgba(8, 8, 24, 0.72)',
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: 'rgba(255, 213, 122, 0.28)',
      },
      text: {
        fontFamily: Fonts.sans,
        fontSize: 11,
        fontWeight: '600',
        color: tokens.primaryText,
        textAlign: 'center',
      },
    }),
  );

  if (!anchor || phase === 'none') return null;

  const message =
    phase === 'entering'
      ? MySkyCopy.proximityEntering.replace('{name}', anchor.owner.name)
      : MySkyCopy.proximityNearby.replace('{name}', anchor.owner.name);

  return (
    <Animated.View style={[styles.wrap, animatedStyle]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={message}
        onPress={() => onPress?.(anchor)}
        style={styles.pill}>
        <Text style={styles.text}>{message}</Text>
      </Pressable>
    </Animated.View>
  );
}

export const MySkyProximityCue = memo(MySkyProximityCueComponent);
