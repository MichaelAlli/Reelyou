import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { SkywritePlayCopy } from '@/constants/skywritePlayCopy';
import { Fonts, Radius } from '@/constants/theme';

interface PlaySkyCueProps {
  onPress: () => void;
  onEditSequence?: () => void;
  showEditSequence?: boolean;
}

function PlaySkyCueComponent({ onPress, onEditSequence, showEditSequence }: PlaySkyCueProps) {
  return (
    <View style={styles.wrap} pointerEvents="box-none">
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [styles.playPill, pressed && styles.pressed]}
        accessibilityRole="button"
        accessibilityLabel={SkywritePlayCopy.playSky}>
        <Text style={styles.playIcon}>▶</Text>
        <Text style={styles.playLabel}>{SkywritePlayCopy.playSky}</Text>
      </Pressable>
      {showEditSequence && onEditSequence ? (
        <Pressable onPress={onEditSequence} hitSlop={8} style={styles.editLink}>
          <Text style={styles.editText}>{SkywritePlayCopy.editSequence}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

export const PlaySkyCue = memo(PlaySkyCueComponent);

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  playPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: 'rgba(232, 200, 114, 0.4)',
    backgroundColor: 'rgba(8, 10, 28, 0.72)',
  },
  playIcon: {
    fontSize: 11,
    color: '#E8C872',
  },
  playLabel: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    fontWeight: '700',
    color: '#F5E6B8',
    letterSpacing: 0.3,
  },
  editLink: {
    minHeight: 32,
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  editText: {
    fontFamily: Fonts.sans,
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(196, 168, 255, 0.85)',
  },
  pressed: { opacity: 0.9 },
});
