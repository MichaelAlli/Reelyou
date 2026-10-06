import { Image } from 'expo-image';
import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Fonts } from '@/constants/theme';

interface SkyReelStoryHeaderProps {
  displayName: string;
  avatarUri?: string | null;
  ageLabel: string | null;
  onProfilePress?: () => void;
  onMenuPress?: () => void;
  onClose: () => void;
}

function SkyReelStoryHeaderComponent({
  displayName,
  avatarUri,
  ageLabel,
  onProfilePress,
  onMenuPress,
  onClose,
}: SkyReelStoryHeaderProps) {
  return (
    <View style={styles.row}>
      <Pressable
        style={styles.identity}
        onPress={onProfilePress}
        disabled={!onProfilePress}
        accessibilityRole="button"
        accessibilityLabel={`${displayName} profile`}>
        <View style={styles.avatarRing}>
          {avatarUri ? (
            <Image source={{ uri: avatarUri }} style={styles.avatar} contentFit="cover" />
          ) : (
            <View style={[styles.avatar, styles.avatarFallback]}>
              <Text style={styles.avatarInitial}>{displayName.slice(0, 1).toUpperCase()}</Text>
            </View>
          )}
        </View>
        <Text style={styles.name} numberOfLines={1}>
          {displayName}
        </Text>
        <Text style={styles.starAccent} accessibilityElementsHidden importantForAccessibility="no">
          ✦
        </Text>
        {ageLabel ? <Text style={styles.age}>{ageLabel}</Text> : null}
      </Pressable>
      <View style={styles.actions}>
        {onMenuPress ? (
          <Pressable
            onPress={onMenuPress}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel="More options"
            style={styles.iconBtn}>
            <Text style={styles.menuIcon}>⋯</Text>
          </Pressable>
        ) : null}
        <Pressable
          onPress={onClose}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel="Close SkyReel"
          style={styles.iconBtn}>
          <Text style={styles.closeIcon}>✕</Text>
        </Pressable>
      </View>
    </View>
  );
}

export const SkyReelStoryHeader = memo(SkyReelStoryHeaderComponent);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    minHeight: 44,
  },
  identity: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    minWidth: 0,
  },
  avatarRing: {
    padding: 2,
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(232, 200, 114, 0.55)',
    backgroundColor: 'rgba(232, 200, 114, 0.08)',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.35)',
  },
  starAccent: {
    fontSize: 10,
    color: 'rgba(232, 200, 114, 0.85)',
    marginTop: 1,
  },
  avatarFallback: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(232, 200, 114, 0.25)',
  },
  avatarInitial: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    fontWeight: '700',
    color: '#FFF8F0',
  },
  name: {
    flexShrink: 1,
    fontFamily: Fonts.sans,
    fontSize: 14,
    fontWeight: '700',
    color: '#FFF8F0',
    textShadowColor: 'rgba(0,0,0,0.55)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  age: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    fontWeight: '500',
    color: 'rgba(255,248,240,0.78)',
    textShadowColor: 'rgba(0,0,0,0.45)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  iconBtn: {
    minWidth: 40,
    minHeight: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuIcon: {
    fontSize: 22,
    lineHeight: 22,
    color: '#FFF8F0',
    fontWeight: '700',
  },
  closeIcon: {
    fontSize: 20,
    lineHeight: 20,
    color: '#FFF8F0',
    fontWeight: '600',
  },
});
