import { memo, useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { Pressable } from 'react-native-gesture-handler';

import { MySkyCopy } from '@/constants/mySkyCopy';
import { Fonts, Radius, Spacing } from '@/constants/theme';
import type { StarInsightBubbleModel } from '@/mySky/buildStarInsightBubble';
import type { MySkyStarDisplay } from '@/mySky/types';
import { useThemedStyles } from '@/theme/useTheme';

interface MySkyStarInsightBubbleProps {
  star: MySkyStarDisplay | null;
  detail: StarInsightBubbleModel | null;
  visible: boolean;
  onClose: () => void;
  onOpenDetail?: () => void;
}

function MySkyStarInsightBubbleComponent({
  star,
  detail,
  visible,
  onClose,
  onOpenDetail,
}: MySkyStarInsightBubbleProps) {
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.94);

  useEffect(() => {
    if (visible) {
      opacity.value = withTiming(1, { duration: 240 });
      scale.value = withSpring(1, { damping: 18, stiffness: 210 });
      return;
    }
    opacity.value = withTiming(0, { duration: 160 });
    scale.value = withTiming(0.96, { duration: 160 });
  }, [opacity, scale, visible]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  const styles = useThemedStyles((tokens) =>
    StyleSheet.create({
      backdrop: {
        ...StyleSheet.absoluteFill,
        zIndex: 28,
      },
      wrap: {
        position: 'absolute',
        width: 272,
        zIndex: 29,
      },
      card: {
        borderRadius: Radius.lg,
        padding: Spacing.md,
        paddingTop: Spacing.md + 4,
        backgroundColor: 'rgba(10, 10, 28, 0.96)',
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: 'rgba(167, 139, 250, 0.42)',
        gap: 8,
        shadowColor: '#A78BFA',
        shadowOpacity: 0.22,
        shadowRadius: 20,
        shadowOffset: { width: 0, height: 6 },
      },
      close: {
        position: 'absolute',
        top: 8,
        right: 8,
        width: 28,
        height: 28,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.06)',
      },
      closeText: {
        fontFamily: Fonts.sans,
        fontSize: 16,
        color: tokens.mutedText,
      },
      eyebrow: {
        fontFamily: Fonts.sans,
        fontSize: 10,
        fontWeight: '600',
        letterSpacing: 0.6,
        textTransform: 'uppercase',
        color: 'rgba(255, 213, 122, 0.82)',
      },
      beta: {
        fontFamily: Fonts.sans,
        fontSize: 9,
        fontWeight: '700',
        letterSpacing: 0.5,
        textTransform: 'uppercase',
        color: 'rgba(196, 168, 255, 0.85)',
      },
      title: {
        fontFamily: Fonts.serif,
        fontSize: 18,
        lineHeight: 24,
        color: tokens.primaryText,
      },
      meta: {
        fontFamily: Fonts.sans,
        fontSize: 11,
        lineHeight: 16,
        color: tokens.mutedText,
      },
      body: {
        fontFamily: Fonts.sans,
        fontSize: 13,
        lineHeight: 19,
        color: tokens.secondaryText,
      },
      excerpt: {
        fontFamily: Fonts.serif,
        fontSize: 13,
        lineHeight: 19,
        fontStyle: 'italic',
        color: tokens.primaryText,
        opacity: 0.92,
      },
      action: {
        marginTop: 4,
        alignSelf: 'flex-start',
        paddingVertical: 6,
        paddingHorizontal: 10,
        borderRadius: Radius.full,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: 'rgba(255, 213, 122, 0.35)',
      },
      actionText: {
        fontFamily: Fonts.sans,
        fontSize: 11,
        fontWeight: '600',
        color: tokens.gold,
      },
    }),
  );

  if (!visible || !star || !detail) return null;

  const left = Math.min(Math.max(star.x * 100 - 14, 4), 56);
  const top = Math.min(Math.max(star.y * 100 - 22, 6), 62);

  return (
    <>
      <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel="Close star detail" />
      <Animated.View style={[styles.wrap, { left: `${left}%`, top: `${top}%` }, animatedStyle]}>
        <View style={styles.card} accessibilityRole="summary">
          <Pressable style={styles.close} onPress={onClose} accessibilityLabel="Close">
            <Text style={styles.closeText}>×</Text>
          </Pressable>
          {detail.isBetaExample ? (
            <Text style={styles.beta}>{MySkyCopy.starInsightBetaLabel}</Text>
          ) : null}
          <Text style={styles.eyebrow}>{detail.eyebrow}</Text>
          <Text style={styles.title}>{detail.title}</Text>
          {detail.dateLabel ? (
            <Text style={styles.meta}>{detail.dateLabel}</Text>
          ) : null}
          {detail.patternLabel ? (
            <Text style={styles.meta}>
              {MySkyCopy.starDetailPatternLabel}: {detail.patternLabel}
            </Text>
          ) : null}
          {detail.visibilityLabel ? (
            <Text style={styles.meta}>{detail.visibilityLabel}</Text>
          ) : null}
          <Text style={styles.body}>{detail.body}</Text>
          {detail.skywriteExcerpt ? (
            <Text style={styles.excerpt} numberOfLines={4}>
              “{detail.skywriteExcerpt}”
            </Text>
          ) : null}
          {onOpenDetail ? (
            <Pressable style={styles.action} onPress={onOpenDetail} accessibilityRole="button">
              <Text style={styles.actionText}>{MySkyCopy.starInsightOpenDetail}</Text>
            </Pressable>
          ) : null}
        </View>
      </Animated.View>
    </>
  );
}

export const MySkyStarInsightBubble = memo(MySkyStarInsightBubbleComponent);
