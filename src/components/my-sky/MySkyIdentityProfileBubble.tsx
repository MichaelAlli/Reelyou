import { memo, useEffect } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { MySkyCopy } from '@/constants/mySkyCopy';
import { Fonts, Radius, Spacing } from '@/constants/theme';
import type { SkyOwnerProfile } from '@/mySky/skyIdentity';
import type { MySkyStarDisplay } from '@/mySky/types';
import { useThemedStyles } from '@/theme/useTheme';

interface MySkyIdentityProfileBubbleProps {
  owner: SkyOwnerProfile;
  anchorStar: MySkyStarDisplay;
  visible: boolean;
  onClose: () => void;
  onViewProfile: () => void;
  onViewFullSky?: () => void;
  onConnect?: () => void;
}

function MySkyIdentityProfileBubbleComponent({
  owner,
  anchorStar,
  visible,
  onClose,
  onViewProfile,
  onViewFullSky,
  onConnect,
}: MySkyIdentityProfileBubbleProps) {
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.92);

  useEffect(() => {
    if (visible) {
      opacity.value = withTiming(1, { duration: 220 });
      scale.value = withSpring(1, { damping: 18, stiffness: 220 });
      return;
    }
    opacity.value = withTiming(0, { duration: 160 });
    scale.value = withTiming(0.94, { duration: 160 });
  }, [opacity, scale, visible]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  const styles = useThemedStyles((tokens) =>
    StyleSheet.create({
      backdrop: {
        ...StyleSheet.absoluteFill,
        zIndex: 20,
      },
      bubbleWrap: {
        position: 'absolute',
        width: 248,
        zIndex: 21,
      },
      bubble: {
        borderRadius: Radius.lg,
        padding: Spacing.md,
        backgroundColor: 'rgba(10, 10, 28, 0.94)',
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: 'rgba(255, 213, 122, 0.35)',
        shadowColor: '#FFD57A',
        shadowOpacity: 0.18,
        shadowRadius: 16,
        shadowOffset: { width: 0, height: 4 },
        gap: Spacing.sm,
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
        zIndex: 2,
      },
      closeText: {
        fontFamily: Fonts.sans,
        fontSize: 16,
        color: tokens.mutedText,
        lineHeight: 18,
      },
      header: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
        paddingRight: Spacing.lg,
      },
      avatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1.5,
        borderColor: 'rgba(255, 213, 122, 0.45)',
      },
      avatarImage: {
        width: 44,
        height: 44,
        borderRadius: 22,
      },
      avatarText: {
        fontFamily: Fonts.sans,
        fontSize: 16,
        fontWeight: '700',
        color: tokens.appBackground,
      },
      name: {
        flex: 1,
        fontFamily: Fonts.sans,
        fontSize: 16,
        fontWeight: '700',
        color: tokens.primaryText,
      },
      subtitle: {
        fontFamily: Fonts.sans,
        fontSize: 12,
        color: tokens.gold,
      },
      bio: {
        fontFamily: Fonts.sans,
        fontSize: 12,
        lineHeight: 17,
        color: tokens.secondaryText,
      },
      northStar: {
        fontFamily: Fonts.sans,
        fontSize: 11,
        lineHeight: 16,
        color: tokens.mutedText,
        fontStyle: 'italic',
      },
      status: {
        alignSelf: 'flex-start',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: Radius.full,
        backgroundColor: 'rgba(167, 139, 250, 0.14)',
      },
      statusText: {
        fontFamily: Fonts.sans,
        fontSize: 10,
        fontWeight: '600',
        color: tokens.secondaryText,
      },
      actions: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginTop: 2,
      },
      action: {
        minHeight: 34,
        paddingHorizontal: 12,
        paddingVertical: 7,
        borderRadius: Radius.full,
        backgroundColor: 'rgba(232, 200, 114, 0.16)',
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: 'rgba(232, 200, 114, 0.38)',
      },
      actionSecondary: {
        backgroundColor: 'rgba(167, 139, 250, 0.12)',
        borderColor: 'rgba(167, 139, 250, 0.28)',
      },
      actionText: {
        fontFamily: Fonts.sans,
        fontSize: 11,
        fontWeight: '600',
        color: tokens.gold,
      },
      actionTextSecondary: {
        color: tokens.secondaryText,
      },
    }),
  );

  if (!visible) return null;

  const bubbleLeft = Math.min(Math.max(anchorStar.x * 100 - 12, 4), 62);
  const bubbleTop = Math.min(Math.max(anchorStar.y * 100 - 18, 8), 72);
  const connected = owner.connectionStatus === 'connected';

  return (
    <>
      <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel="Close profile" />
      <Animated.View
        style={[styles.bubbleWrap, { left: `${bubbleLeft}%`, top: `${bubbleTop}%` }, animatedStyle]}>
        <View style={styles.bubble}>
          <Pressable style={styles.close} onPress={onClose} accessibilityLabel="Close">
            <Text style={styles.closeText}>×</Text>
          </Pressable>

          <View style={styles.header}>
            {owner.avatarUri ? (
              <Image source={{ uri: owner.avatarUri }} style={styles.avatarImage} />
            ) : (
              <View style={[styles.avatar, { backgroundColor: owner.avatarColor }]}>
                <Text style={styles.avatarText}>{owner.avatarInitials}</Text>
              </View>
            )}
            <View style={{ flex: 1 }}>
              <Text style={styles.name} numberOfLines={1}>
                {owner.name}
              </Text>
              {owner.subtitle ? (
                <Text style={styles.subtitle} numberOfLines={1}>
                  {owner.subtitle}
                </Text>
              ) : null}
            </View>
          </View>

          {owner.bio ? (
            <Text style={styles.bio} numberOfLines={3}>
              {owner.bio}
            </Text>
          ) : null}

          {owner.northStarSummary ? (
            <Text style={styles.northStar} numberOfLines={2}>
              {MySkyCopy.identityNorthStarPrefix} {owner.northStarSummary}
            </Text>
          ) : null}

          {!owner.isSelf && owner.connectionStatus ? (
            <View style={styles.status}>
              <Text style={styles.statusText}>
                {connected ? MySkyCopy.identityConnected : MySkyCopy.identityDiscoverable}
              </Text>
            </View>
          ) : null}

          <View style={styles.actions}>
            <Pressable style={styles.action} onPress={onViewProfile}>
              <Text style={styles.actionText}>{MySkyCopy.identityViewProfile}</Text>
            </Pressable>
            {!owner.isSelf && onViewFullSky ? (
              <Pressable style={[styles.action, styles.actionSecondary]} onPress={onViewFullSky}>
                <Text style={[styles.actionText, styles.actionTextSecondary]}>
                  {MySkyCopy.identityViewFullSky}
                </Text>
              </Pressable>
            ) : null}
            {!owner.isSelf && onConnect ? (
              <Pressable
                style={[styles.action, styles.actionSecondary]}
                onPress={connected ? undefined : onConnect}
                disabled={connected}>
                <Text style={[styles.actionText, styles.actionTextSecondary]}>
                  {connected ? MySkyCopy.identityConnected : MySkyCopy.identityConnect}
                </Text>
              </Pressable>
            ) : null}
          </View>
        </View>
      </Animated.View>
    </>
  );
}

export const MySkyIdentityProfileBubble = memo(MySkyIdentityProfileBubbleComponent);
