import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { SkywritePlayCopy } from '@/constants/skywritePlayCopy';
import { Fonts, Radius } from '@/constants/theme';

interface PlaySkyCueProps {
  onPress: () => void;
  onEditSequence?: () => void;
  showEditSequence?: boolean;
  disabled?: boolean;
  disabledHint?: string;
}

function PlaySkyCueComponent({
  onPress,
  onEditSequence,
  showEditSequence,
  disabled = false,
  disabledHint,
}: PlaySkyCueProps) {
  return (
    <View style={styles.wrap} pointerEvents="box-none">
      <Pressable
        onPress={disabled ? undefined : onPress}
        disabled={disabled}
        style={({ pressed }) => [
          styles.playPill,
          disabled && styles.playPillDisabled,
          pressed && !disabled && styles.pressed,
        ]}
        accessibilityRole="button"
        accessibilityLabel={disabled ? disabledHint ?? SkywritePlayCopy.playSkyUnavailable : SkywritePlayCopy.playSky}
        accessibilityState={{ disabled }}>
        <Text style={[styles.playIcon, disabled && styles.playLabelDisabled]}>▶</Text>
        <Text style={[styles.playLabel, disabled && styles.playLabelDisabled]}>
          {SkywritePlayCopy.playSky}
        </Text>
      </Pressable>
      {disabled && disabledHint ? (
        <Text style={styles.disabledHint}>{disabledHint}</Text>
      ) : null}
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
  playPillDisabled: {
    borderColor: 'rgba(232, 200, 114, 0.18)',
    backgroundColor: 'rgba(8, 10, 28, 0.35)',
  },
  playLabelDisabled: {
    color: 'rgba(245, 230, 184, 0.45)',
  },
  disabledHint: {
    fontFamily: Fonts.sans,
    fontSize: 11,
    color: 'rgba(248,244,236,0.5)',
    textAlign: 'center',
    maxWidth: 280,
  },
});
