import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { HomePalette } from '@/constants/homeLayout';
import { SkywriteCopy } from '@/constants/skywriteCopy';
import { Fonts } from '@/constants/theme';

interface SkywriteVoicePanelProps {
  visible: boolean;
  elapsedLabel: string;
  isPaused: boolean;
  isVoiceover?: boolean;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
  onCancel: () => void;
}

function SkywriteVoicePanelComponent({
  visible,
  elapsedLabel,
  isPaused,
  isVoiceover = false,
  onPause,
  onResume,
  onStop,
  onCancel,
}: SkywriteVoicePanelProps) {
  if (!visible) return null;

  return (
    <View style={styles.panel}>
      <Text style={styles.title}>
        {isVoiceover ? SkywriteCopy.voiceoverTitle : SkywriteCopy.voiceNoteTitle}
      </Text>
      <Text style={styles.timer} accessibilityLiveRegion="polite">
        {elapsedLabel}
      </Text>
      <View style={styles.actions}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={isPaused ? 'Resume recording' : 'Pause recording'}
          onPress={isPaused ? onResume : onPause}
          style={styles.secondaryBtn}>
          <Text style={styles.secondaryText}>{isPaused ? SkywriteCopy.resume : SkywriteCopy.pause}</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Stop and save voice note"
          onPress={onStop}
          style={styles.primaryBtn}>
          <Text style={styles.primaryText}>{SkywriteCopy.stop}</Text>
        </Pressable>
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Cancel voice recording"
        onPress={onCancel}
        style={styles.cancelBtn}>
        <Text style={styles.cancelText}>{SkywriteCopy.cancel}</Text>
      </Pressable>
    </View>
  );
}

export const SkywriteVoicePanel = memo(SkywriteVoicePanelComponent);

const styles = StyleSheet.create({
  panel: {
    marginTop: 10,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(167, 139, 250, 0.24)',
    backgroundColor: 'rgba(8, 8, 24, 0.62)',
    padding: 14,
    gap: 10,
  },
  title: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    fontWeight: '600',
    color: HomePalette.textPrimary,
  },
  timer: {
    fontFamily: Fonts.sans,
    fontSize: 24,
    fontWeight: '600',
    color: HomePalette.gold,
    letterSpacing: 1,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
  },
  secondaryBtn: {
    flex: 1,
    minHeight: 44,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(167, 139, 250, 0.28)',
  },
  secondaryText: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(235, 228, 248, 0.82)',
  },
  primaryBtn: {
    flex: 1,
    minHeight: 44,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(232, 200, 114, 0.16)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(232, 200, 114, 0.42)',
  },
  primaryText: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    fontWeight: '700',
    color: HomePalette.gold,
  },
  cancelBtn: {
    alignSelf: 'center',
    minHeight: 36,
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  cancelText: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    color: 'rgba(235, 228, 248, 0.55)',
  },
});
