import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { SkywriteCopy } from '@/constants/skywriteCopy';
import { Fonts } from '@/constants/theme';
import {
  clampVolume,
  resolveOriginalVideoVolume,
  stepOriginalVideoVolume,
  syncOriginalVideoAudioState,
} from '@/skywrite/media/skywriteOriginalVideoVolume';
import type { SkywriteMedia } from '@/skywrite/types';

interface SkywriteOriginalVideoAudioControlsProps {
  media: SkywriteMedia;
  onChange: (media: SkywriteMedia) => void;
}

function SkywriteOriginalVideoAudioControlsComponent({
  media,
  onChange,
}: SkywriteOriginalVideoAudioControlsProps) {
  if (!media.video?.uri) return null;

  const volume = resolveOriginalVideoVolume(media);
  const muted = volume <= 0;
  const percent = Math.round(volume * 100);

  const applyVolume = (nextVolume: number) => {
    const v = clampVolume(nextVolume);
    onChange({
      ...media,
      originalVideoVolume: v,
      originalVideoAudio: syncOriginalVideoAudioState(v),
    });
  };

  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>{SkywriteCopy.videoOriginalSoundTitle}</Text>
      <View style={styles.row}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={muted ? SkywriteCopy.videoOriginalUnmute : SkywriteCopy.videoOriginalMute}
          onPress={() => applyVolume(muted ? 1 : 0)}
          style={[styles.chip, muted && styles.chipMuted]}>
          <Text style={styles.chipText}>{muted ? SkywriteCopy.videoOriginalUnmute : SkywriteCopy.videoOriginalMute}</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Lower original video volume"
          onPress={() => applyVolume(stepOriginalVideoVolume(volume, -0.1))}
          style={styles.stepBtn}>
          <Text style={styles.stepText}>−</Text>
        </Pressable>
        <View style={styles.meterTrack} accessibilityLabel={`Original video volume ${percent} percent`}>
          <View style={[styles.meterFill, { width: `${percent}%` }]} />
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Raise original video volume"
          onPress={() => applyVolume(stepOriginalVideoVolume(volume, 0.1))}
          style={styles.stepBtn}>
          <Text style={styles.stepText}>+</Text>
        </Pressable>
        <Text style={styles.percent}>{percent}%</Text>
      </View>
      <Text style={styles.hint}>{SkywriteCopy.videoOriginalSoundHint}</Text>
    </View>
  );
}

export const SkywriteOriginalVideoAudioControls = memo(SkywriteOriginalVideoAudioControlsComponent);

const styles = StyleSheet.create({
  wrap: {
    marginTop: 8,
    gap: 6,
    paddingVertical: 4,
  },
  title: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    fontWeight: '700',
    color: 'rgba(235, 228, 248, 0.82)',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  chip: {
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(232, 200, 114, 0.45)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    minHeight: 36,
    justifyContent: 'center',
  },
  chipMuted: {
    backgroundColor: 'rgba(232, 200, 114, 0.12)',
  },
  chipText: {
    fontFamily: Fonts.sans,
    fontSize: 11,
    fontWeight: '600',
    color: '#E8C872',
  },
  stepBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(167, 139, 250, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepText: {
    fontFamily: Fonts.sans,
    fontSize: 18,
    fontWeight: '700',
    color: 'rgba(248, 244, 236, 0.88)',
  },
  meterTrack: {
    flex: 1,
    minWidth: 72,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(167, 139, 250, 0.2)',
    overflow: 'hidden',
  },
  meterFill: {
    height: '100%',
    backgroundColor: 'rgba(232, 200, 114, 0.85)',
  },
  percent: {
    fontFamily: Fonts.sans,
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(235, 228, 248, 0.65)',
    minWidth: 36,
    textAlign: 'right',
  },
  hint: {
    fontFamily: Fonts.sans,
    fontSize: 11,
    lineHeight: 15,
    color: 'rgba(235, 228, 248, 0.48)',
  },
});
