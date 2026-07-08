import { StyleSheet, Text, View } from 'react-native';

import { CosmicTheme, Fonts, Radius, Spacing } from '@/constants/theme';
import type { User } from '@/types';

interface ProfileHeaderProps {
  user: User;
  compact?: boolean;
}

export function ProfileHeader({ user, compact }: ProfileHeaderProps) {
  return (
    <View style={[styles.container, compact && styles.compact]}>
      <View style={[styles.avatar, { backgroundColor: user.avatarColor }]}>
        <Text style={styles.initials}>{user.avatarInitials}</Text>
        <View style={styles.avatarGlow} />
      </View>
      <Text style={styles.name}>{user.name}</Text>
      <Text style={styles.subtitle}>{user.subtitle}</Text>
      {!compact && (
        <>
          <Text style={styles.bio}>{user.bio}</Text>
          <Text style={styles.location}>{user.location}</Text>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: Spacing.lg,
  },
  compact: {
    paddingVertical: Spacing.md,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
    borderWidth: 2,
    borderColor: CosmicTheme.gold,
  },
  avatarGlow: {
    position: 'absolute',
    width: 110,
    height: 110,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: CosmicTheme.goldMuted,
  },
  initials: {
    fontFamily: Fonts.sans,
    fontSize: 32,
    fontWeight: '700',
    color: CosmicTheme.background,
  },
  name: {
    fontFamily: Fonts.sans,
    fontSize: 24,
    fontWeight: '700',
    color: CosmicTheme.textPrimary,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    color: CosmicTheme.gold,
    marginTop: Spacing.xs,
    textAlign: 'center',
  },
  bio: {
    fontFamily: Fonts.sans,
    fontSize: 15,
    color: CosmicTheme.textSecondary,
    textAlign: 'center',
    marginTop: Spacing.md,
    lineHeight: 22,
    paddingHorizontal: Spacing.lg,
  },
  location: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    color: CosmicTheme.textMuted,
    marginTop: Spacing.sm,
  },
});
