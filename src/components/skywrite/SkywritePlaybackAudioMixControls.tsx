import { memo, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { SkywriteVolumeSlider } from '@/components/skywrite/SkywriteVolumeSlider';
import { SkywriteCopy } from '@/constants/skywriteCopy';
import { Fonts } from '@/constants/theme';
import {
  clampVolume,
  resolveOriginalVideoVolume,
  stepOriginalVideoVolume,
  syncOriginalVideoAudioState,
} from '@/skywrite/media/skywriteOriginalVideoVolume';
import {
  resolveVoiceoverVolume,
  stepVoiceoverVolume,
} from '@/skywrite/media/skywriteVoiceoverVolume';
import type { SkywriteMedia } from '@/skywrite/types';

interface SkywritePlaybackAudioMixControlsProps {
  media: SkywriteMedia;
  onChange: (media: SkywriteMedia) => void;
  compact?: boolean;
  /** Collapsed by default; expands to show sliders and mute controls. */
  collapsible?: boolean;
}

function SkywritePlaybackAudioMixControlsComponent({
  media,
  onChange,
  compact = false,
  collapsible = false,
}: SkywritePlaybackAudioMixControlsProps) {
  const [expanded, setExpanded] = useState(!collapsible);
  const preMuteOriginalRef = useRef(1);
  const preMuteVoiceoverRef = useRef(1);

  const hasOriginal = Boolean(media.video?.uri);
  const hasVoiceover = Boolean(media.audio?.uri);

  if (!hasOriginal && !hasVoiceover) return null;

  const originalVolume = resolveOriginalVideoVolume(media);
  const voiceoverVolume = resolveVoiceoverVolume(media);
  const originalMuted = originalVolume <= 0;
  const voiceoverMuted = voiceoverVolume <= 0;

  const patchMedia = (patch: Partial<SkywriteMedia>) => {
    onChange({ ...media, ...patch });
  };

  const setOriginalVolume = (next: number) => {
    const v = clampVolume(next);
    if (v > 0) preMuteOriginalRef.current = v;
    patchMedia({
      originalVideoVolume: v,
      originalVideoAudio: syncOriginalVideoAudioState(v),
    });
  };

  const setVoiceoverVolume = (next: number) => {
    const v = clampVolume(next);
    if (v > 0) preMuteVoiceoverRef.current = v;
    patchMedia({ voiceoverVolume: v });
  };

  const toggleOriginalMute = () => {
    if (originalMuted) {
      setOriginalVolume(preMuteOriginalRef.current > 0 ? preMuteOriginalRef.current : 1);
    } else {
      if (originalVolume > 0) preMuteOriginalRef.current = originalVolume;
      setOriginalVolume(0);
    }
  };

  const toggleVoiceoverMute = () => {
    if (voiceoverMuted) {
      setVoiceoverVolume(preMuteVoiceoverRef.current > 0 ? preMuteVoiceoverRef.current : 1);
    } else {
      if (voiceoverVolume > 0) preMuteVoiceoverRef.current = voiceoverVolume;
      setVoiceoverVolume(0);
    }
  };

  const summaryParts: string[] = [];
  if (hasOriginal) {
    summaryParts.push(originalMuted ? 'Original muted' : `Original ${Math.round(originalVolume * 100)}%`);
  }
  if (hasVoiceover) {
    summaryParts.push(voiceoverMuted ? 'Voiceover muted' : `Voiceover ${Math.round(voiceoverVolume * 100)}%`);
  }

  return (
    <View style={[styles.wrap, compact && styles.wrapCompact]}>
      {collapsible ? (
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ expanded }}
          accessibilityLabel="Audio mix"
          onPress={() => setExpanded((open) => !open)}
          style={styles.collapseHeader}>
          <Text style={styles.collapseTitle}>Audio mix</Text>
          <Text style={styles.collapseSummary} numberOfLines={1}>
            {summaryParts.join(' · ')}
          </Text>
          <Text style={styles.collapseChevron}>{expanded ? '▾' : '▸'}</Text>
        </Pressable>
      ) : null}

      {!collapsible || expanded ? (
        <>
      {hasOriginal ? (
        <View style={styles.trackBlock}>
          <View style={styles.trackHeader}>
            <Text style={styles.trackTitle}>{SkywriteCopy.videoOriginalSoundTitle}</Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={
                originalMuted ? SkywriteCopy.videoOriginalUnmute : SkywriteCopy.videoOriginalMute
              }
              onPress={toggleOriginalMute}
              style={[styles.muteChip, originalMuted && styles.muteChipActive]}>
              <Text style={styles.muteChipText}>
                {originalMuted ? SkywriteCopy.videoOriginalUnmute : SkywriteCopy.videoOriginalMute}
              </Text>
            </Pressable>
          </View>
          <SkywriteVolumeSlider
            label="Original video"
            value={originalVolume}
            onChange={setOriginalVolume}
          />
          <View style={styles.stepRow}>
            <Pressable
              accessibilityLabel="Lower original video volume"
              onPress={() => setOriginalVolume(stepOriginalVideoVolume(originalVolume, -0.1))}
              style={styles.stepBtn}>
              <Text style={styles.stepText}>−</Text>
            </Pressable>
            <Pressable
              accessibilityLabel="Raise original video volume"
              onPress={() => setOriginalVolume(stepOriginalVideoVolume(originalVolume, 0.1))}
              style={styles.stepBtn}>
              <Text style={styles.stepText}>+</Text>
            </Pressable>
          </View>
        </View>
      ) : null}

      {hasVoiceover ? (
        <View style={styles.trackBlock}>
          <View style={styles.trackHeader}>
            <Text style={styles.trackTitle}>{SkywriteCopy.voiceoverTitle}</Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={voiceoverMuted ? 'Unmute voiceover' : 'Mute voiceover'}
              onPress={toggleVoiceoverMute}
              style={[styles.muteChip, voiceoverMuted && styles.muteChipActive]}>
              <Text style={styles.muteChipText}>
                {voiceoverMuted ? 'Unmute voiceover' : 'Mute voiceover'}
              </Text>
            </Pressable>
          </View>
          <SkywriteVolumeSlider
            label="Voiceover"
            value={voiceoverVolume}
            onChange={setVoiceoverVolume}
          />
          <View style={styles.stepRow}>
            <Pressable
              accessibilityLabel="Lower voiceover volume"
              onPress={() => setVoiceoverVolume(stepVoiceoverVolume(voiceoverVolume, -0.1))}
              style={styles.stepBtn}>
              <Text style={styles.stepText}>−</Text>
            </Pressable>
            <Pressable
              accessibilityLabel="Raise voiceover volume"
              onPress={() => setVoiceoverVolume(stepVoiceoverVolume(voiceoverVolume, 0.1))}
              style={styles.stepBtn}>
              <Text style={styles.stepText}>+</Text>
            </Pressable>
          </View>
        </View>
      ) : null}

      {!compact ? (
        <Text style={styles.hint}>{SkywriteCopy.videoOriginalSoundHint}</Text>
      ) : null}
        </>
      ) : null}
    </View>
  );
}

export const SkywritePlaybackAudioMixControls = memo(SkywritePlaybackAudioMixControlsComponent);

const styles = StyleSheet.create({
  wrap: {
    gap: 10,
    paddingVertical: 6,
  },
  wrapCompact: {
    paddingVertical: 4,
    gap: 8,
  },
  collapseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minHeight: 44,
    paddingVertical: 4,
  },
  collapseTitle: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    fontWeight: '700',
    color: '#E8C872',
  },
  collapseSummary: {
    flex: 1,
    fontFamily: Fonts.sans,
    fontSize: 11,
    color: 'rgba(235, 228, 248, 0.55)',
  },
  collapseChevron: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    color: 'rgba(232, 200, 114, 0.85)',
  },
  trackBlock: {
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 2,
  },
  trackHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    flexWrap: 'wrap',
  },
  trackTitle: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    fontWeight: '700',
    color: 'rgba(235, 228, 248, 0.82)',
  },
  muteChip: {
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(232, 200, 114, 0.45)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    minHeight: 32,
    justifyContent: 'center',
  },
  muteChipActive: {
    backgroundColor: 'rgba(232, 200, 114, 0.12)',
  },
  muteChipText: {
    fontFamily: Fonts.sans,
    fontSize: 11,
    fontWeight: '600',
    color: '#E8C872',
  },
  stepRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 2,
  },
  stepBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(167, 139, 250, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepText: {
    fontFamily: Fonts.sans,
    fontSize: 16,
    fontWeight: '700',
    color: 'rgba(248, 244, 236, 0.88)',
  },
  hint: {
    fontFamily: Fonts.sans,
    fontSize: 11,
    lineHeight: 15,
    color: 'rgba(235, 228, 248, 0.48)',
  },
});
