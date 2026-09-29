import { memo, type ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import {
  OWNER_PROFILE_CARD_RADIUS,
  OWNER_PROFILE_HORIZONTAL_INSET,
  OWNER_PROFILE_PANEL_BORDER,
} from '@/components/profile/owner/ownerProfileLayout';
import { ConnectedSkiesCopy } from '@/constants/connectedSkiesCopy';
import { Fonts } from '@/constants/theme';
import type { ProfileRelationshipCounts } from '@/social/skyFollow/profileRelationshipCounts';

interface OwnerProfileRelationshipCountsRowProps {
  counts: ProfileRelationshipCounts;
  onPressFollowedSkies: () => void;
  onPressSkyFollowing: () => void;
  /** Visitor-only mutual line — omit on own profile. */
  belowRow?: ReactNode;
}

function CountCell({
  label,
  value,
  onPress,
  accessibilityLabel,
}: {
  label: string;
  value: number;
  onPress: () => void;
  accessibilityLabel: string;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      style={({ pressed }) => [styles.cell, pressed && styles.pressed]}>
      <Text style={styles.value} maxFontSizeMultiplier={1.3}>
        {value}
      </Text>
      <Text style={styles.label} numberOfLines={2} maxFontSizeMultiplier={1.25}>
        {label}
      </Text>
    </Pressable>
  );
}

function OwnerProfileRelationshipCountsRowComponent({
  counts,
  onPressFollowedSkies,
  onPressSkyFollowing,
  belowRow,
}: OwnerProfileRelationshipCountsRowProps) {
  return (
    <View style={styles.outer}>
      <View style={styles.card}>
        <View style={styles.mainRow}>
          <View style={styles.titleColumn}>
            <Text
              style={styles.sectionTitle}
              numberOfLines={2}
              maxFontSizeMultiplier={1.25}
              accessibilityRole="header">
              {ConnectedSkiesCopy.profileConnectionsSectionTitle}
            </Text>
          </View>
          <View style={styles.countsRow}>
            <CountCell
              label={ConnectedSkiesCopy.followedSkiesLabel}
              value={counts.followedSkies}
              onPress={onPressFollowedSkies}
              accessibilityLabel={`${ConnectedSkiesCopy.followedSkiesLabel}, ${counts.followedSkies}`}
            />
            <View style={styles.divider} />
            <CountCell
              label={ConnectedSkiesCopy.skyFollowingLabel}
              value={counts.skyFollowing}
              onPress={onPressSkyFollowing}
              accessibilityLabel={`${ConnectedSkiesCopy.skyFollowingLabel}, ${counts.skyFollowing}`}
            />
          </View>
        </View>
        {belowRow ? <View style={styles.mutualFooter}>{belowRow}</View> : null}
      </View>
    </View>
  );
}

export const OwnerProfileRelationshipCountsRow = memo(OwnerProfileRelationshipCountsRowComponent);

const styles = StyleSheet.create({
  outer: {
    marginHorizontal: OWNER_PROFILE_HORIZONTAL_INSET,
    marginTop: 8,
  },
  card: {
    borderRadius: OWNER_PROFILE_CARD_RADIUS,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: OWNER_PROFILE_PANEL_BORDER,
    backgroundColor: 'rgba(10, 14, 34, 0.55)',
    overflow: 'hidden',
  },
  mainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 68,
    paddingVertical: 8,
    paddingHorizontal: 12,
    gap: 6,
  },
  titleColumn: {
    flexShrink: 0,
    width: 78,
    justifyContent: 'center',
    paddingRight: 4,
  },
  sectionTitle: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    lineHeight: 15,
    fontWeight: '700',
    color: 'rgba(235, 228, 248, 0.72)',
    textAlign: 'left',
  },
  countsRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'stretch',
    minWidth: 0,
  },
  cell: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 2,
    paddingHorizontal: 2,
    minHeight: 52,
  },
  pressed: { opacity: 0.88 },
  value: {
    fontFamily: Fonts.sans,
    fontSize: 18,
    fontWeight: '700',
    color: '#E8C872',
    lineHeight: 22,
  },
  label: {
    fontFamily: Fonts.sans,
    fontSize: 9,
    lineHeight: 11,
    fontWeight: '600',
    color: 'rgba(235, 228, 248, 0.65)',
    textAlign: 'center',
    marginTop: 2,
  },
  divider: {
    width: StyleSheet.hairlineWidth,
    alignSelf: 'stretch',
    backgroundColor: 'rgba(167, 139, 250, 0.22)',
    marginVertical: 4,
  },
  mutualFooter: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(167, 139, 250, 0.18)',
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
});
