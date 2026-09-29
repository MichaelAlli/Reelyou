import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { OWNER_PROFILE_HORIZONTAL_INSET } from '@/components/profile/owner/ownerProfileLayout';
import { ConnectedSkiesCopy } from '@/constants/connectedSkiesCopy';
import { Fonts } from '@/constants/theme';
import { resolvePublicSkyOwnerProfile } from '@/mySky/skyIdentity';

interface VisitorProfileMutualConnectionsRowProps {
  mutualIds: readonly string[];
  onPress: () => void;
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return `${parts[0][0] ?? ''}${parts[1][0] ?? ''}`.toUpperCase();
  return (name.slice(0, 2) || '?').toUpperCase();
}

function VisitorProfileMutualConnectionsRowComponent({
  mutualIds,
  onPress,
}: VisitorProfileMutualConnectionsRowProps) {
  if (mutualIds.length === 0) return null;

  const count = mutualIds.length;
  const label =
    count === 1
      ? '1 mutual connection'
      : `${count} mutual connections`;

  const previewIds = mutualIds.slice(0, 3);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${label}. ${ConnectedSkiesCopy.mutualConnectionsA11y}`}
      onPress={onPress}
      style={({ pressed }) => [styles.wrap, pressed && styles.pressed]}>
      <View style={styles.avatarRow}>
        {previewIds.map((id) => {
          const profile = resolvePublicSkyOwnerProfile(id, 'none');
          const color = profile?.avatarColor ?? 'rgba(232, 200, 114, 0.35)';
          const labelText = profile?.avatarInitials ?? initials(profile?.name ?? id);
          return (
            <View key={id} style={[styles.avatar, { backgroundColor: color }]}>
              <Text style={styles.avatarText}>{labelText}</Text>
            </View>
          );
        })}
      </View>
      <Text style={styles.label} maxFontSizeMultiplier={1.3}>
        {label}
      </Text>
    </Pressable>
  );
}

export const VisitorProfileMutualConnectionsRow = memo(
  VisitorProfileMutualConnectionsRowComponent,
);

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginHorizontal: OWNER_PROFILE_HORIZONTAL_INSET,
    marginBottom: 4,
    minHeight: 36,
    paddingVertical: 4,
  },
  pressed: { opacity: 0.88 },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -6,
    borderWidth: 1.5,
    borderColor: 'rgba(8, 10, 24, 0.9)',
  },
  avatarText: {
    fontFamily: Fonts.sans,
    fontSize: 9,
    fontWeight: '700',
    color: '#FFF8F0',
  },
  label: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(232, 200, 114, 0.88)',
  },
});
