import { memo } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { MySkyCopy } from '@/constants/mySkyCopy';
import { Fonts, Radius, Spacing } from '@/constants/theme';
import type { PublicSkyVisitorContext } from '@/mySky/resolvePublicSkyContext';
import type { SkyOwnerProfile } from '@/mySky/skyIdentity';
import { useThemedStyles } from '@/theme/useTheme';

interface MySkyPublicSkyHeaderProps {
  owner: SkyOwnerProfile;
  visitorContext: PublicSkyVisitorContext;
  onBack: () => void;
  onConnect?: () => void;
  onMessage?: () => void;
}

function MySkyPublicSkyHeaderComponent({
  owner,
  visitorContext,
  onBack,
  onConnect,
  onMessage,
}: MySkyPublicSkyHeaderProps) {
  const connected = visitorContext.connectionStatus === 'connected';

  const styles = useThemedStyles((tokens) =>
    StyleSheet.create({
      wrap: {
        paddingHorizontal: Spacing.md,
        paddingBottom: Spacing.xs,
        gap: Spacing.sm,
        zIndex: 2,
      },
      topRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
      },
      back: {
        minHeight: 36,
        justifyContent: 'center',
        paddingRight: Spacing.sm,
      },
      backText: {
        fontFamily: Fonts.sans,
        fontSize: 14,
        fontWeight: '600',
        color: tokens.gold,
      },
      ownerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
      },
      avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: 'rgba(255, 213, 122, 0.35)',
      },
      avatarImage: {
        width: 40,
        height: 40,
        borderRadius: 20,
      },
      avatarText: {
        fontFamily: Fonts.sans,
        fontSize: 14,
        fontWeight: '700',
        color: '#05070A',
      },
      copy: {
        flex: 1,
        gap: 2,
        minWidth: 0,
      },
      eyebrow: {
        fontFamily: Fonts.sans,
        fontSize: 10,
        fontWeight: '700',
        letterSpacing: 0.3,
        textTransform: 'uppercase',
        color: tokens.gold,
      },
      name: {
        fontFamily: Fonts.serif,
        fontSize: 18,
        fontWeight: '600',
        color: tokens.primaryText,
      },
      subtitle: {
        fontFamily: Fonts.sans,
        fontSize: 12,
        lineHeight: 16,
        color: tokens.secondaryText,
      },
      northStar: {
        fontFamily: Fonts.sans,
        fontSize: 11,
        lineHeight: 15,
        color: tokens.mutedText,
        fontStyle: 'italic',
      },
      metaRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6,
        alignItems: 'center',
      },
      pill: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: Radius.full,
        backgroundColor: 'rgba(167, 139, 250, 0.14)',
      },
      pillGold: {
        backgroundColor: 'rgba(232, 200, 114, 0.12)',
      },
      pillText: {
        fontFamily: Fonts.sans,
        fontSize: 10,
        fontWeight: '600',
        color: tokens.secondaryText,
      },
      connect: {
        minHeight: 32,
        paddingHorizontal: 12,
        borderRadius: Radius.full,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: 'rgba(232, 200, 114, 0.38)',
        backgroundColor: 'rgba(232, 200, 114, 0.12)',
        alignItems: 'center',
        justifyContent: 'center',
      },
      connectText: {
        fontFamily: Fonts.sans,
        fontSize: 11,
        fontWeight: '700',
        color: tokens.gold,
      },
    }),
  );

  const ownerLabel = MySkyCopy.publicSkyOwnerLabel.replace('{name}', owner.name);

  return (
    <View style={styles.wrap}>
      <View style={styles.topRow}>
        <Pressable accessibilityRole="button" onPress={onBack} style={styles.back}>
          <Text style={styles.backText}>{MySkyCopy.publicSkyBack}</Text>
        </Pressable>
        {connected && onMessage ? (
          <Pressable accessibilityRole="button" onPress={onMessage} style={styles.connect}>
            <Text style={styles.connectText}>Message</Text>
          </Pressable>
        ) : null}
        {!connected && onConnect ? (
          <Pressable accessibilityRole="button" onPress={onConnect} style={styles.connect}>
            <Text style={styles.connectText}>{MySkyCopy.identityConnect}</Text>
          </Pressable>
        ) : null}
      </View>

      <View style={styles.ownerRow}>
        {owner.avatarUri ? (
          <Image source={{ uri: owner.avatarUri }} style={styles.avatarImage} />
        ) : (
          <View style={[styles.avatar, { backgroundColor: owner.avatarColor }]}>
            <Text style={styles.avatarText}>{owner.avatarInitials}</Text>
          </View>
        )}
        <View style={styles.copy}>
          <Text style={styles.eyebrow}>{ownerLabel}</Text>
          <Text style={styles.name} numberOfLines={1}>
            {owner.name}
          </Text>
          {owner.subtitle ? (
            <Text style={styles.subtitle} numberOfLines={1}>
              {owner.subtitle}
            </Text>
          ) : null}
          {owner.northStarSummary ? (
            <Text style={styles.northStar} numberOfLines={2}>
              {MySkyCopy.identityNorthStarPrefix} {owner.northStarSummary}
            </Text>
          ) : null}
        </View>
      </View>

      <View style={styles.metaRow}>
        <View style={[styles.pill, connected && styles.pillGold]}>
          <Text style={styles.pillText}>
            {connected ? MySkyCopy.identityConnected : MySkyCopy.publicSkyVisitorLabel}
          </Text>
        </View>
        {visitorContext.mutualConnectionLabel ? (
          <View style={styles.pill}>
            <Text style={styles.pillText} numberOfLines={1}>
              {visitorContext.mutualConnectionLabel}
            </Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}

export const MySkyPublicSkyHeader = memo(MySkyPublicSkyHeaderComponent);
