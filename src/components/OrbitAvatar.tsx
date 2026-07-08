import { Pressable, StyleSheet, Text, View } from 'react-native';

import { CosmicTheme, Fonts, Radius, Spacing } from '@/constants/theme';
import type { OrbitUser } from '@/types';

interface OrbitAvatarProps {
  user: OrbitUser;
  size?: 'sm' | 'md' | 'lg';
  onPress?: () => void;
  showLabel?: boolean;
}

const sizes = { sm: 44, md: 56, lg: 72 };

export function OrbitAvatar({ user, size = 'md', onPress, showLabel = true }: OrbitAvatarProps) {
  const dim = sizes[size];

  return (
    <Pressable onPress={onPress} style={styles.wrapper}>
      <View
        style={[
          styles.avatar,
          {
            width: dim,
            height: dim,
            borderRadius: dim / 2,
            backgroundColor: user.avatarColor,
          },
        ]}>
        <Text style={[styles.initials, { fontSize: dim * 0.35 }]}>{user.avatarInitials}</Text>
      </View>
      {showLabel && (
        <>
          <Text style={styles.name} numberOfLines={1}>
            {user.name}
          </Text>
          <Text style={styles.label} numberOfLines={1}>
            {user.label}
          </Text>
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    width: 80,
  },
  avatar: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: CosmicTheme.goldMuted,
    marginBottom: Spacing.xs,
  },
  initials: {
    fontFamily: Fonts.sans,
    fontWeight: '700',
    color: CosmicTheme.background,
  },
  name: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    fontWeight: '600',
    color: CosmicTheme.textPrimary,
    textAlign: 'center',
  },
  label: {
    fontFamily: Fonts.sans,
    fontSize: 10,
    color: CosmicTheme.textMuted,
    textAlign: 'center',
    marginTop: 2,
  },
});
