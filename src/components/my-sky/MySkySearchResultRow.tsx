import { memo } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { MySkyCopy } from '@/constants/mySkyCopy';
import { Fonts, Radius, Spacing } from '@/constants/theme';
import {
  resolveSearchResultActions,
  type SearchResultActionKind,
} from '@/mySky/skySearchDiscovery';
import type { SkySearchResult } from '@/mySky/skySearchSources';
import { useThemedStyles } from '@/theme/useTheme';

interface MySkySearchResultRowProps {
  result: SkySearchResult;
  canJumpToSky: boolean;
  exploreGroup?: boolean;
  onAction: (kind: SearchResultActionKind, result: SkySearchResult) => void;
}

function MySkySearchResultRowComponent({
  result,
  canJumpToSky,
  exploreGroup = false,
  onAction,
}: MySkySearchResultRowProps) {
  const actions = resolveSearchResultActions(result, canJumpToSky);

  const styles = useThemedStyles((tokens) =>
    StyleSheet.create({
      row: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: Spacing.sm,
        paddingVertical: 10,
        paddingHorizontal: Spacing.sm,
        borderRadius: Radius.lg,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: exploreGroup
          ? 'rgba(167, 139, 250, 0.14)'
          : 'rgba(167, 139, 250, 0.22)',
        backgroundColor: exploreGroup
          ? 'rgba(12, 10, 28, 0.42)'
          : 'rgba(12, 10, 28, 0.58)',
        opacity: exploreGroup ? 0.92 : 1,
      },
      avatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: exploreGroup
          ? 'rgba(232, 200, 114, 0.22)'
          : 'rgba(255, 213, 122, 0.32)',
      },
      avatarImage: {
        width: 44,
        height: 44,
        borderRadius: 22,
      },
      avatarText: {
        fontFamily: Fonts.sans,
        fontSize: 14,
        fontWeight: '700',
        color: '#05070A',
      },
      copy: {
        flex: 1,
        gap: 3,
        minWidth: 0,
      },
      nameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        flexWrap: 'wrap',
      },
      name: {
        fontFamily: Fonts.sans,
        fontSize: 14,
        fontWeight: '600',
        color: tokens.primaryText,
      },
      statusPill: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: Radius.full,
        backgroundColor: result.isConnected
          ? 'rgba(167, 139, 250, 0.16)'
          : 'rgba(232, 200, 114, 0.12)',
      },
      statusText: {
        fontFamily: Fonts.sans,
        fontSize: 9,
        fontWeight: '700',
        color: result.isConnected ? tokens.secondaryText : tokens.gold,
        letterSpacing: 0.2,
      },
      bio: {
        fontFamily: Fonts.sans,
        fontSize: 12,
        lineHeight: 16,
        color: tokens.secondaryText,
      },
      community: {
        fontFamily: Fonts.sans,
        fontSize: 10,
        fontWeight: '600',
        color: tokens.gold,
      },
      actions: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6,
        marginTop: 6,
      },
      actionPrimary: {
        minHeight: 30,
        paddingHorizontal: 12,
        borderRadius: Radius.full,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: 'rgba(232, 200, 114, 0.45)',
        backgroundColor: 'rgba(232, 200, 114, 0.16)',
        alignItems: 'center',
        justifyContent: 'center',
      },
      actionSecondary: {
        borderColor: 'rgba(167, 139, 250, 0.32)',
        backgroundColor: 'rgba(167, 139, 250, 0.1)',
      },
      actionText: {
        fontFamily: Fonts.sans,
        fontSize: 10,
        fontWeight: '700',
        color: tokens.gold,
      },
      actionTextSecondary: {
        color: tokens.secondaryText,
      },
    }),
  );

  const statusLabel = result.isConnected
    ? result.connectionContext === 'shared-community'
      ? MySkyCopy.searchSharedCommunity
      : MySkyCopy.identityConnected
    : MySkyCopy.identityDiscoverable;

  return (
    <View style={styles.row}>
      {result.avatarUri ? (
        <Image source={{ uri: result.avatarUri }} style={styles.avatarImage} />
      ) : (
        <View style={[styles.avatar, { backgroundColor: result.avatarColor }]}>
          <Text style={styles.avatarText}>{result.avatarInitials}</Text>
        </View>
      )}

      <View style={styles.copy}>
        <View style={styles.nameRow}>
          <Text style={styles.name} numberOfLines={1}>
            {result.name}
          </Text>
          <View style={styles.statusPill}>
            <Text style={styles.statusText}>{statusLabel}</Text>
          </View>
        </View>

        <Text style={styles.bio} numberOfLines={2}>
          {result.bioLine}
        </Text>

        {result.sharedCommunityName ? (
          <Text style={styles.community} numberOfLines={1}>
            {MySkyCopy.searchSharedIn.replace('{community}', result.sharedCommunityName)}
          </Text>
        ) : null}

        <View style={styles.actions}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`${actions.primary.label}: ${result.name}`}
            onPress={() => onAction(actions.primary.kind, result)}
            disabled={!actions.primary.enabled}
            style={styles.actionPrimary}>
            <Text style={styles.actionText}>{actions.primary.label}</Text>
          </Pressable>
          {actions.secondary ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`${actions.secondary.label}: ${result.name}`}
              onPress={() => onAction(actions.secondary!.kind, result)}
              disabled={!actions.secondary.enabled}
              style={[styles.actionPrimary, styles.actionSecondary]}>
              <Text style={[styles.actionText, styles.actionTextSecondary]}>
                {actions.secondary.label}
              </Text>
            </Pressable>
          ) : null}
        </View>
      </View>
    </View>
  );
}

export const MySkySearchResultRow = memo(MySkySearchResultRowComponent);
