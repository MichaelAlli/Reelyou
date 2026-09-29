import { memo } from 'react';
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
  isOwnProfile: boolean;
  onPressExploringSkies: () => void;
  onPressSkyExplorers: () => void;
  onPressSharedConnections?: () => void;
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
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label} numberOfLines={2}>
        {label}
      </Text>
    </Pressable>
  );
}

function OwnerProfileRelationshipCountsRowComponent({
  counts,
  isOwnProfile,
  onPressExploringSkies,
  onPressSkyExplorers,
  onPressSharedConnections,
}: OwnerProfileRelationshipCountsRowProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.sectionTitle}>{ConnectedSkiesCopy.profileEntryTitle}</Text>
      <View style={styles.row}>
        <CountCell
          label={ConnectedSkiesCopy.exploringSkiesLabel}
          value={counts.exploringSkies}
          onPress={onPressExploringSkies}
          accessibilityLabel={`${ConnectedSkiesCopy.exploringSkiesLabel}, ${counts.exploringSkies}`}
        />
        <View style={styles.divider} />
        <CountCell
          label={ConnectedSkiesCopy.skyExplorersLabel}
          value={counts.skyExplorers}
          onPress={onPressSkyExplorers}
          accessibilityLabel={`${ConnectedSkiesCopy.skyExplorersLabel}, ${counts.skyExplorers}`}
        />
        {!isOwnProfile && onPressSharedConnections ? (
          <>
            <View style={styles.divider} />
            <CountCell
              label={ConnectedSkiesCopy.sharedConnectionsLabel}
              value={counts.sharedConnections}
              onPress={onPressSharedConnections}
              accessibilityLabel={`${ConnectedSkiesCopy.sharedConnectionsLabel}, ${counts.sharedConnections}`}
            />
          </>
        ) : null}
      </View>
    </View>
  );
}

export const OwnerProfileRelationshipCountsRow = memo(OwnerProfileRelationshipCountsRowComponent);

const styles = StyleSheet.create({
  card: {
    marginHorizontal: OWNER_PROFILE_HORIZONTAL_INSET,
    marginTop: 10,
    borderRadius: OWNER_PROFILE_CARD_RADIUS,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: OWNER_PROFILE_PANEL_BORDER,
    backgroundColor: 'rgba(10, 14, 34, 0.55)',
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 8,
  },
  sectionTitle: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    fontWeight: '700',
    color: '#F5F0FF',
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  cell: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    paddingHorizontal: 4,
    minHeight: 56,
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
    marginVertical: 4,
  },
});
