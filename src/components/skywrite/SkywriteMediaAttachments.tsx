import { Image } from 'expo-image';
import { memo } from 'react';
import { Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';

import { SkywriteVoiceCapture } from '@/components/skywrite/SkywriteVoiceCapture';
import { HomePalette } from '@/constants/homeLayout';
import { Fonts } from '@/constants/theme';
import type { SkywriteAudioMedia, SkywritePhotoMedia } from '@/skywrite/types';

interface SkywriteMediaAttachmentsProps {
  photo: SkywritePhotoMedia | null;
  audio: SkywriteAudioMedia | null;
  voiceCaptureOpen: boolean;
  isRecording: boolean;
  elapsedMs: number;
  elapsedLabel: string;
  isPlaying: boolean;
  onReplacePhoto: () => void;
  onRemovePhoto: () => void;
  onRecord: () => void;
  onStopRecording: () => void;
  onCancelRecording: () => void;
  onTogglePlayback: () => void;
  onReRecord: () => void;
  onRemoveAudio: () => void;
}

function SkywriteMediaAttachmentsComponent({
  photo,
  audio,
  voiceCaptureOpen,
  isRecording,
  elapsedMs,
  elapsedLabel,
  isPlaying,
  onReplacePhoto,
  onRemovePhoto,
  onRecord,
  onStopRecording,
  onCancelRecording,
  onTogglePlayback,
  onReRecord,
  onRemoveAudio,
}: SkywriteMediaAttachmentsProps) {
  const { width: screenWidth } = useWindowDimensions();
  const previewWidth = Math.min(screenWidth - 80, 320);
  const isVoiceover = Boolean(photo);

  const photoAspect =
    photo?.width && photo?.height && photo.height > 0 ? photo.width / photo.height : 1;
  const photoHeight = Math.min(220, previewWidth / photoAspect);

  const voiceMode = audio ? 'playback' : isRecording ? 'recording' : voiceCaptureOpen ? 'idle' : null;

  if (!photo && !audio && !voiceMode) return null;

  return (
    <View style={styles.wrap}>
      {photo ? (
        <View style={[styles.photoBlock, { width: previewWidth }]}>
          <View style={styles.photoFrame}>
            <Image
              source={{ uri: photo.uri }}
              style={{ width: previewWidth, height: photoHeight }}
              contentFit="cover"
              accessibilityLabel="Attached photo"
            />
          </View>
          <View style={styles.photoActions}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Replace photo"
              onPress={onReplacePhoto}
              style={styles.photoAction}>
              <Text style={styles.photoActionText}>Replace</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Remove photo"
              onPress={onRemovePhoto}
              style={styles.photoAction}>
              <Text style={styles.photoActionText}>Remove</Text>
            </Pressable>
          </View>
        </View>
      ) : null}

      {voiceMode ? (
        <View style={[styles.voiceWrap, photo ? { width: previewWidth } : styles.voiceWrapFull]}>
          <SkywriteVoiceCapture
            mode={voiceMode}
            isVoiceover={isVoiceover}
            elapsedMs={elapsedMs}
            elapsedLabel={elapsedLabel}
            audio={audio}
            isPlaying={isPlaying}
            onRecord={onRecord}
            onStop={onStopRecording}
            onCancel={onCancelRecording}
            onTogglePlayback={onTogglePlayback}
            onReRecord={onReRecord}
            onRemove={onRemoveAudio}
          />
        </View>
      ) : null}
    </View>
  );
}

export const SkywriteMediaAttachments = memo(SkywriteMediaAttachmentsComponent);

const styles = StyleSheet.create({
  wrap: {
    marginTop: 12,
    gap: 10,
  },
  photoBlock: {
    gap: 8,
    alignSelf: 'flex-start',
    maxWidth: '100%',
  },
  photoFrame: {
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(167, 139, 250, 0.24)',
  },
  photoActions: {
    flexDirection: 'row',
    gap: 12,
  },
  photoAction: {
    minHeight: 36,
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  photoActionText: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    fontWeight: '600',
    color: HomePalette.gold,
  },
  voiceWrap: {
    alignSelf: 'flex-start',
    maxWidth: '100%',
  },
  voiceWrapFull: {
    alignSelf: 'stretch',
  },
});
