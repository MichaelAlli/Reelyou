import { memo, type ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import {
  OWNER_PROFILE_HORIZONTAL_INSET,
} from '@/components/profile/owner/ownerProfileLayout';
import { ConnectedSkiesCopy } from '@/constants/connectedSkiesCopy';
import { Fonts } from '@/constants/theme';
import type { ProfileRelationshipCounts } from '@/social/skyFollow/profileRelationshipCounts';

interface OwnerProfileRelationshipCountsRowProps {
  counts: ProfileRelationshipCounts;
  onPressConnectedSkies: () => void;
  onPressFollowedSkies: () => void;
  onPressSkyFollowing: () => void;
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
      <Text style={styles.value} maxFontSizeMultiplier={1.25}>
        {value}
      </Text>
      <Text style={styles.label} numberOfLines={2} maxFontSizeMultiplier={1.2}>
        {label}
      </Text>
    </Pressable>
  );
}

function OwnerProfileRelationshipCountsRowComponent({
  counts,
  onPressConnectedSkies,
  onPressFollowedSkies,
  onPressSkyFollowing,
  belowRow,
}: OwnerProfileRelationshipCountsRowProps) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.sectionTitle}>{ConnectedSkiesCopy.profileConnectionsSectionTitle}</Text>
      <View style={styles.row}>
        <CountCell
          label={ConnectedSkiesCopy.connectedSkiesLabel}
          value={counts.connectedSkies}
          onPress={onPressConnectedSkies}
          accessibilityLabel={`${ConnectedSkiesCopy.connectedSkiesLabel}, ${counts.connectedSkies}`}
        />
        <View style={styles.divider} />
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
      {belowRow}
    </View>
  );
}

export const OwnerProfileRelationshipCountsRow = memo(OwnerProfileRelationshipCountsRowComponent);

const styles = StyleSheet.create({
  wrap: {
    marginHorizontal: OWNER_PROFILE_HORIZONTAL_INSET,
    marginTop: 8,
    paddingVertical: 6,
    gap: 4,
  },
  sectionTitle: {
    fontFamily: Fonts.sans,
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(235, 228, 248, 0.55)',
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  cell: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingVertical: 4,
    paddingHorizontal: 2,
    minHeight: 48,
  },
  pressed: { opacity: 0.88 },
  value: {
    fontFamily: Fonts.sans,
    fontSize: 20,
    fontWeight: '700',
    color: '#E8C872',
  },
  label: {
    fontFamily: Fonts.sans,
    fontSize: 10,
    lineHeight: 13,
    fontWeight: '600',
    color: 'rgba(235, 228, 248, 0.65)',
    textAlign: 'center',
    marginTop: 2,
  },
  divider: {
    width: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(167, 139, 250, 0.22)',
    marginVertical: 2,
  },
});
