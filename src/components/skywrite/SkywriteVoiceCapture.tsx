import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { SkywriteAudioWaveform } from '@/components/skywrite/SkywriteAudioWaveform';
import { HomePalette } from '@/constants/homeLayout';
import { SkywriteCopy } from '@/constants/skywriteCopy';
import { Fonts } from '@/constants/theme';
import { formatDurationMs } from '@/skywrite/mediaActions';
import type { SkywriteAudioMedia } from '@/skywrite/types';

type VoiceCaptureMode = 'idle' | 'recording' | 'playback';

interface SkywriteVoiceCaptureProps {
  mode: VoiceCaptureMode;
  isVoiceover: boolean;
  elapsedMs: number;
  elapsedLabel: string;
  audio: SkywriteAudioMedia | null;
  isPlaying: boolean;
  onRecord: () => void;
  onStop: () => void;
  onCancel: () => void;
  onTogglePlayback: () => void;
  onReRecord: () => void;
  onRemove: () => void;
}

function SkywriteVoiceCaptureComponent({
  mode,
  isVoiceover,
  elapsedMs,
  elapsedLabel,
  audio,
  isPlaying,
  onRecord,
  onStop,
  onCancel,
  onTogglePlayback,
  onReRecord,
  onRemove,
}: SkywriteVoiceCaptureProps) {
  const title = isVoiceover ? SkywriteCopy.voiceoverTitle : SkywriteCopy.voiceNoteTitle;
  const recordA11y = isVoiceover ? 'Record voiceover' : 'Record voice note';
  const playA11y = isVoiceover
    ? isPlaying
      ? 'Pause voiceover'
      : 'Play voiceover'
    : isPlaying
      ? 'Pause voice note'
      : 'Play voice note';
  const removeA11y = isVoiceover ? 'Remove voiceover' : 'Remove voice note';
  const reRecordA11y = isVoiceover ? 'Re-record voiceover' : 'Re-record voice note';

  if (mode === 'idle') {
    return (
      <View style={styles.panel}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.hint}>
          {isVoiceover ? SkywriteCopy.voiceoverIdleHint : SkywriteCopy.voiceNoteIdleHint}
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={recordA11y}
          onPress={onRecord}
          style={styles.recordBtn}>
          <Text style={styles.recordBtnText}>{SkywriteCopy.record}</Text>
        </Pressable>
      </View>
    );
  }

  if (mode === 'recording') {
    return (
      <View style={styles.panel}>
        <View style={styles.recordingHeader}>
          <View style={styles.recordingDot} accessibilityLabel="Recording" />
          <Text style={styles.recordingLabel}>{SkywriteCopy.recordingLabel}</Text>
          <Text style={styles.timer} accessibilityLiveRegion="polite">
            {elapsedLabel}
          </Text>
        </View>
        <SkywriteAudioWaveform active seed={Math.floor(elapsedMs / 200)} />
        <View style={styles.recordingActions}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Cancel recording"
            onPress={onCancel}
            style={styles.cancelBtn}>
            <Text style={styles.cancelText}>{SkywriteCopy.cancel}</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Stop recording"
            onPress={onStop}
            style={styles.stopBtn}>
            <Text style={styles.stopText}>{SkywriteCopy.stop}</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  if (!audio) return null;

  return (
    <View style={[styles.panel, isVoiceover && styles.panelAttached]}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.playbackRow}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={playA11y}
          onPress={onTogglePlayback}
          style={styles.playBtn}>
          <Text style={styles.playIcon}>{isPlaying ? '❚❚' : '▶'}</Text>
        </Pressable>
        <Text style={styles.duration}>{formatDurationMs(audio.durationMs ?? 0)}</Text>
        <SkywriteAudioWaveform active={isPlaying} seed={Math.floor((audio.durationMs ?? 0) / 400)} />
      </View>
      <View style={styles.playbackActions}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={reRecordA11y}
          onPress={onReRecord}
          style={styles.secondaryAction}>
          <Text style={styles.secondaryActionText}>
            {isVoiceover ? SkywriteCopy.reRecordVoiceover : SkywriteCopy.reRecordVoiceNote}
          </Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={removeA11y}
          onPress={onRemove}
          style={styles.secondaryAction}>
          <Text style={styles.secondaryActionText}>{SkywriteCopy.removeMedia}</Text>
        </Pressable>
      </View>
    </View>
  );
}

export const SkywriteVoiceCapture = memo(SkywriteVoiceCaptureComponent);

const styles = StyleSheet.create({
  panel: {
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(167, 139, 250, 0.24)',
    backgroundColor: 'rgba(8, 8, 24, 0.62)',
    padding: 14,
    gap: 10,
  },
  panelAttached: {
    borderColor: 'rgba(232, 200, 114, 0.28)',
  },
  title: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    fontWeight: '600',
    color: HomePalette.textPrimary,
  },
  hint: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    lineHeight: 17,
    color: 'rgba(235, 228, 248, 0.62)',
  },
  recordBtn: {
    alignSelf: 'flex-start',
    minHeight: 40,
    borderRadius: 999,
    paddingHorizontal: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(232, 200, 114, 0.14)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(232, 200, 114, 0.42)',
  },
  recordBtnText: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    fontWeight: '700',
    color: HomePalette.gold,
  },
  recordingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  recordingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: HomePalette.gold,
  },
  recordingLabel: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    fontWeight: '600',
    color: HomePalette.textPrimary,
    flex: 1,
  },
  timer: {
    fontFamily: Fonts.sans,
    fontSize: 16,
    fontWeight: '600',
    color: HomePalette.gold,
    letterSpacing: 0.5,
  },
  recordingActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  cancelBtn: {
    minHeight: 40,
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  cancelText: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    color: 'rgba(235, 228, 248, 0.55)',
  },
  stopBtn: {
    minHeight: 40,
    borderRadius: 999,
    paddingHorizontal: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(232, 200, 114, 0.14)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(232, 200, 114, 0.42)',
  },
  stopText: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    fontWeight: '700',
    color: HomePalette.gold,
  },
  playbackRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  playBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(232, 200, 114, 0.12)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(232, 200, 114, 0.35)',
  },
  playIcon: {
    fontFamily: Fonts.sans,
    fontSize: 11,
    fontWeight: '700',
    color: HomePalette.gold,
  },
  duration: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    color: 'rgba(235, 228, 248, 0.72)',
    minWidth: 36,
  },
  playbackActions: {
    flexDirection: 'row',
    gap: 16,
  },
  secondaryAction: {
    minHeight: 36,
    justifyContent: 'center',
  },
  secondaryActionText: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(235, 228, 248, 0.58)',
  },
});
