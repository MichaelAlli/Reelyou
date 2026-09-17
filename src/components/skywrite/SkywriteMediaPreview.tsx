import { Image } from 'expo-image';
import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { HomePalette } from '@/constants/homeLayout';
import { SkywriteCopy } from '@/constants/skywriteCopy';
import { Fonts } from '@/constants/theme';
import { formatDurationMs } from '@/skywrite/mediaActions';
import type { SkywriteAudioMedia, SkywritePhotoMedia } from '@/skywrite/types';

interface SkywriteMediaPreviewProps {
  photo: SkywritePhotoMedia | null;
  audio: SkywriteAudioMedia | null;
  isPhotoVoiceover: boolean;
  isPlaying: boolean;
  onRemovePhoto: () => void;
  onRemoveAudio: () => void;
  onTogglePlayback: () => void;
}

function AudioPlayer({
  audio,
  isPhotoVoiceover,
  isPlaying,
  onTogglePlayback,
  onRemoveAudio,
  attached,
}: {
  audio: SkywriteAudioMedia;
  isPhotoVoiceover: boolean;
  isPlaying: boolean;
  onTogglePlayback: () => void;
  onRemoveAudio: () => void;
  attached?: boolean;
}) {
  return (
    <View style={[styles.audioRow, attached && styles.audioAttached]}>
      {isPhotoVoiceover ? (
        <Text style={styles.audioKind}>{SkywriteCopy.voiceoverBadge}</Text>
      ) : null}
      <View style={styles.audioControls}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={isPlaying ? 'Pause voice note' : 'Play voice note'}
          onPress={onTogglePlayback}
          style={styles.playBtn}>
          <Text style={styles.playIcon}>{isPlaying ? '❚❚' : '▶'}</Text>
        </Pressable>
        <View style={styles.waveTrack} accessibilityElementsHidden>
          <View style={[styles.waveFill, { width: isPlaying ? '72%' : '38%' }]} />
        </View>
        <Text style={styles.duration}>{formatDurationMs(audio.durationMs ?? 0)}</Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={isPhotoVoiceover ? SkywriteCopy.removeVoiceover : 'Remove voice note'}
          onPress={onRemoveAudio}
          style={styles.audioRemove}>
          <Text style={styles.audioRemoveText}>{SkywriteCopy.removeMedia}</Text>
        </Pressable>
      </View>
    </View>
  );
}

function SkywriteMediaPreviewComponent({
  photo,
  audio,
  isPhotoVoiceover,
  isPlaying,
  onRemovePhoto,
  onRemoveAudio,
  onTogglePlayback,
}: SkywriteMediaPreviewProps) {
  if (!photo && !audio) return null;

  if (photo && audio && isPhotoVoiceover) {
    return (
      <View style={styles.wrap}>
        <View style={styles.comboGroup}>
          <View style={styles.photoWrap}>
            <Image
              source={{ uri: photo.uri }}
              style={styles.photo}
              contentFit="cover"
              accessibilityLabel="Attached photo"
            />
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Remove photo"
              onPress={onRemovePhoto}
              style={styles.removeBtn}>
              <Text style={styles.removeText}>×</Text>
            </Pressable>
          </View>
          <AudioPlayer
            audio={audio}
            isPhotoVoiceover
            isPlaying={isPlaying}
            onTogglePlayback={onTogglePlayback}
            onRemoveAudio={onRemoveAudio}
            attached
          />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.wrap}>
      {photo ? (
        <View style={styles.photoWrap}>
          <Image
            source={{ uri: photo.uri }}
            style={styles.photo}
            contentFit="cover"
            accessibilityLabel="Attached photo"
          />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Remove photo"
            onPress={onRemovePhoto}
            style={styles.removeBtn}>
            <Text style={styles.removeText}>×</Text>
          </Pressable>
        </View>
      ) : null}

      {audio ? (
        <AudioPlayer
          audio={audio}
          isPhotoVoiceover={false}
          isPlaying={isPlaying}
          onTogglePlayback={onTogglePlayback}
          onRemoveAudio={onRemoveAudio}
        />
      ) : null}
    </View>
  );
}

export const SkywriteMediaPreview = memo(SkywriteMediaPreviewComponent);

const styles = StyleSheet.create({
  wrap: {
    marginTop: 12,
  },
  comboGroup: {
    gap: 8,
    alignSelf: 'flex-start',
    maxWidth: '100%',
  },
  photoWrap: {
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(167, 139, 250, 0.24)',
  },
  photo: {
    width: 168,
    height: 168,
    backgroundColor: 'rgba(8, 8, 24, 0.6)',
  },
  removeBtn: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(6, 8, 22, 0.78)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(167, 139, 250, 0.28)',
  },
  removeText: {
    fontFamily: Fonts.sans,
    fontSize: 18,
    lineHeight: 20,
    color: HomePalette.textPrimary,
  },
  audioRow: {
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(167, 139, 250, 0.22)',
    backgroundColor: 'rgba(8, 8, 24, 0.55)',
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 6,
  },
  audioAttached: {
    width: 168,
    borderColor: 'rgba(232, 200, 114, 0.28)',
    backgroundColor: 'rgba(8, 8, 24, 0.68)',
  },
  audioKind: {
    fontFamily: Fonts.sans,
    fontSize: 10,
    fontWeight: '600',
    color: HomePalette.gold,
    letterSpacing: 0.3,
  },
  audioControls: {
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
  waveTrack: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(167, 139, 250, 0.18)',
    overflow: 'hidden',
  },
  waveFill: {
    height: '100%',
    borderRadius: 2,
    backgroundColor: 'rgba(232, 200, 114, 0.72)',
  },
  duration: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    color: 'rgba(235, 228, 248, 0.72)',
    minWidth: 36,
    textAlign: 'right',
  },
  audioRemove: {
    minHeight: 32,
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  audioRemoveText: {
    fontFamily: Fonts.sans,
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(235, 228, 248, 0.55)',
  },
});
