import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ConnectedSkiesCopy } from '@/constants/connectedSkiesCopy';
import { Fonts } from '@/constants/theme';
import { resolvePublicSkyOwnerProfile } from '@/mySky/skyIdentity';
import {
  resolveDemoMutualConnectionDisplayName,
  usesDemoMutualConnectionsOverlay,
} from '@/profile/profileMutualConnectionsDemo';

interface VisitorProfileMutualConnectionsRowProps {
  mutualIds: readonly string[];
  onPress: () => void;
  profileOwnerId: string;
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return `${parts[0][0] ?? ''}${parts[1][0] ?? ''}`.toUpperCase();
  return (name.slice(0, 2) || '?').toUpperCase();
}

function VisitorProfileMutualConnectionsRowComponent({
  mutualIds,
  onPress,
  profileOwnerId,
}: VisitorProfileMutualConnectionsRowProps) {
  if (mutualIds.length === 0) return null;

  const count = mutualIds.length;
  const previewIds = mutualIds.slice(0, 3);
  const demoHint = usesDemoMutualConnectionsOverlay(profileOwnerId);

  const resolveShortName = (id: string): string => {
    const demoName = resolveDemoMutualConnectionDisplayName(id);
    if (demoName) return demoName;
    const profile = resolvePublicSkyOwnerProfile(id, 'none');
    const full = profile?.name ?? id;
    return full.split(/\s+/)[0] ?? full;
  };

  const label =
    count >= 3
      ? ConnectedSkiesCopy.mutualYouBothKnowNamedLabel(
          resolveShortName(mutualIds[0]!),
          resolveShortName(mutualIds[1]!),
          count - 2,
        )
      : count === 2
        ? ConnectedSkiesCopy.mutualYouBothKnowNamedLabel(
            resolveShortName(mutualIds[0]!),
            resolveShortName(mutualIds[1]!),
            0,
          )
        : ConnectedSkiesCopy.mutualSkiesYouBothKnowLabel(count);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${label}. ${ConnectedSkiesCopy.mutualConnectionsA11y}`}
      onPress={onPress}
      style={({ pressed }) => [styles.wrap, pressed && styles.pressed]}>
      <View style={styles.avatarRow}>
        {previewIds.map((id, index) => {
          const profile = resolvePublicSkyOwnerProfile(id, 'none');
          const color = profile?.avatarColor ?? 'rgba(232, 200, 114, 0.35)';
          const labelText = profile?.avatarInitials ?? initials(profile?.name ?? id);
          return (
            <View
              key={id}
              style={[
                styles.avatar,
                index === 0 && styles.avatarFirst,
                { backgroundColor: color },
              ]}>
              <Text style={styles.avatarText}>{labelText}</Text>
            </View>
          );
        })}
      </View>
      <Text style={styles.label} maxFontSizeMultiplier={1.3} numberOfLines={2}>
        {label}
      </Text>
      <Text style={styles.chevron} accessibilityElementsHidden>
        →
      </Text>
      {demoHint ? (
        <Text style={styles.demoTag} accessibilityLabel="Demo mutual connections preview">
          Demo
        </Text>
      ) : null}
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
    gap: 8,
    minHeight: 36,
    paddingVertical: 2,
  },
  pressed: { opacity: 0.88 },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 0,
  },
  avatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -5,
    borderWidth: 1.5,
    borderColor: 'rgba(8, 10, 24, 0.9)',
  },
  avatarFirst: {
    marginLeft: 0,
  },
  avatarText: {
    fontFamily: Fonts.sans,
    fontSize: 8,
    fontWeight: '700',
    color: '#FFF8F0',
  },
  label: {
    flex: 1,
    fontFamily: Fonts.sans,
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(232, 200, 114, 0.9)',
    lineHeight: 16,
  },
  chevron: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    color: 'rgba(232, 200, 114, 0.65)',
    marginLeft: 2,
  },
  demoTag: {
    fontFamily: Fonts.sans,
    fontSize: 9,
    fontWeight: '700',
    color: 'rgba(235, 228, 248, 0.45)',
    letterSpacing: 0.3,
    marginLeft: 4,
  },
});
