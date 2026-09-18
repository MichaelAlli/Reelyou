import { memo, useEffect } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { MySkyCopy } from '@/constants/mySkyCopy';
import { Fonts, Radius } from '@/constants/theme';
import type { NearbySkyAnchor } from '@/mySky/buildNearbySkies';
import type { SkyProximityPhase } from '@/mySky/skyProximity';
import type { SkyRegionMode } from '@/mySky/skyRegionContext';
import { useThemedStyles } from '@/theme/useTheme';

interface MySkyProximityCueProps {
  anchor: NearbySkyAnchor | null;
  phase: SkyProximityPhase;
  regionMode?: SkyRegionMode;
  onPress?: (anchor: NearbySkyAnchor) => void;
}

function MySkyProximityCueComponent({
  anchor,
  phase,
  regionMode = 'own',
  onPress,
}: MySkyProximityCueProps) {
  const opacity = useSharedValue(0);

  const showCue =
    regionMode === 'returning' ||
    (anchor && phase !== 'none' && regionMode !== 'own');

  useEffect(() => {
    opacity.value = withTiming(showCue ? 1 : 0, { duration: 280 });
  }, [opacity, showCue]);

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

  if (!showCue) return null;

  let message: string = MySkyCopy.proximityReturning;
  if (anchor && regionMode !== 'returning') {
    if (phase === 'entered') {
      message = MySkyCopy.proximityEntered.replace('{name}', anchor.owner.name);
    } else if (phase === 'entering') {
      message = MySkyCopy.proximityEntering.replace('{name}', anchor.owner.name);
    } else {
      message = MySkyCopy.proximityNearby.replace('{name}', anchor.owner.name);
    }
  }

  const content = (
    <Animated.View style={[styles.wrap, animatedStyle]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={message}
        onPress={() => anchor && onPress?.(anchor)}
        disabled={!anchor || !onPress}
        style={styles.pill}>
        <Text style={styles.text}>{message}</Text>
      </Pressable>
    </Animated.View>
  );

  return content;
}

export const MySkyProximityCue = memo(MySkyProximityCueComponent);
