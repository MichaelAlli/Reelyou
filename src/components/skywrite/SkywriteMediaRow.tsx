import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { HomePalette } from '@/constants/homeLayout';
import { Fonts } from '@/constants/theme';

interface SkywriteMediaRowProps {
  photoLabel: string;
  voiceLabel: string;
  photoA11y: string;
  voiceA11y: string;
  photoActive: boolean;
  voiceActive: boolean;
  onPhotoPress: () => void;
  onVoicePress: () => void;
}

function SkywriteMediaRowComponent({
  photoLabel,
  voiceLabel,
  photoA11y,
  voiceA11y,
  photoActive,
  voiceActive,
  onPhotoPress,
  onVoicePress,
}: SkywriteMediaRowProps) {
  return (
    <View style={styles.row}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={photoA11y}
        accessibilityState={{ selected: photoActive }}
        onPress={onPhotoPress}
        style={[styles.action, photoActive && styles.actionActive]}>
        <Text style={styles.actionIcon}>📷</Text>
        <Text style={[styles.actionText, photoActive && styles.actionTextActive]}>{photoLabel}</Text>
      </Pressable>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={voiceA11y}
        accessibilityState={{ selected: voiceActive }}
        onPress={onVoicePress}
        style={[styles.action, voiceActive && styles.actionActive]}>
        <Text style={styles.actionIcon}>🎙</Text>
        <Text style={[styles.actionText, voiceActive && styles.actionTextActive]}>{voiceLabel}</Text>
      </Pressable>
    </View>
  );
}

export const SkywriteMediaRow = memo(SkywriteMediaRowComponent);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 12,
  },
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minHeight: 40,
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(167, 139, 250, 0.22)',
    backgroundColor: 'rgba(8, 8, 24, 0.45)',
  },
  actionActive: {
    borderColor: 'rgba(232, 200, 114, 0.42)',
    backgroundColor: 'rgba(232, 200, 114, 0.08)',
  },
  actionIcon: {
    fontSize: 14,
  },
  actionText: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(235, 228, 248, 0.78)',
  },
  actionTextActive: {
    color: HomePalette.gold,
  },
});
