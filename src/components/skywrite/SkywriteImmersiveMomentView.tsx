import { ResizeMode, Video } from 'expo-av';
import { Image } from 'expo-image';
import { memo, useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { SkywriteAudioWaveform } from '@/components/skywrite/SkywriteAudioWaveform';
import { SkywritePlayCopy } from '@/constants/skywritePlayCopy';
import { getSkywriteWriteInputStyle } from '@/constants/skywriteTextStyles';
import { Fonts, Radius, Spacing } from '@/constants/theme';
import { formatSkywriteAudioDuration } from '@/skywrite/media/skywriteMediaPreviewUtils';
import { useSkywriteImmersiveVideoPlayback } from '@/skywrite/media/useSkywriteImmersiveVideoPlayback';
import type { SkywritePlayStepKind } from '@/skywrite/play/skywritePlayTypes';
import type { SkywriteRecord } from '@/skywrite/types';

interface SkywriteImmersiveMomentViewProps {
  record: SkywriteRecord;
  stepKind: SkywritePlayStepKind;
  stepIndex: number;
  stepCount: number;
  previewId: string;
  audioPlaying: boolean;
  onToggleAudio: (previewId: string, uri: string) => void;
  onExit: () => void;
  onPrevious: () => void;
  onNext: () => void;
  canPrevious: boolean;
  canNext: boolean;
  /** Stops video/voiceover when navigating. */
  onBeforeStepChange?: () => void;
}

function SkywriteImmersiveMomentViewComponent({
  record,
  stepKind,
  stepIndex,
  stepCount,
  previewId,
  audioPlaying,
  onToggleAudio,
  onExit,
  onPrevious,
  onNext,
  canPrevious,
  canNext,
  onBeforeStepChange,
}: SkywriteImmersiveMomentViewProps) {
  const videoActive = stepKind === 'video' && Boolean(record.media.video?.uri);
  const videoPlayback = useSkywriteImmersiveVideoPlayback(record, videoActive);

  useEffect(() => {
    return () => {
      void videoPlayback.cleanup();
    };
  }, [videoPlayback]);

  const audioUri = record.media.audio?.uri ?? null;
  const showVideoVoiceover =
    record.mediaMode === 'video_voiceover' && stepKind === 'video' && Boolean(audioUri);

  const handlePrevious = () => {
    onBeforeStepChange?.();
    void videoPlayback.cleanup();
    onPrevious();
  };

  const handleNext = () => {
    onBeforeStepChange?.();
    void videoPlayback.cleanup();
    onNext();
  };

  const handleExit = () => {
    onBeforeStepChange?.();
    void videoPlayback.cleanup();
    onExit();
  };

  return (
    <>
      <View style={styles.topBar}>
        <Pressable onPress={handleExit} accessibilityLabel={SkywritePlayCopy.exitPlay}>
          <Text style={styles.exitText}>{SkywritePlayCopy.exitPlay}</Text>
        </Pressable>
        <Text style={styles.progress}>{SkywritePlayCopy.progress(stepIndex + 1, stepCount)}</Text>
      </View>

      <View style={styles.content}>
        {stepKind === 'text' ? (
          <Text style={[styles.bodyText, getSkywriteWriteInputStyle(record.textStyle)]}>
            {record.text.trim() || '…'}
          </Text>
        ) : null}

        {stepKind === 'photo' && record.media.photo?.uri ? (
          <>
            <Image
              source={{ uri: record.media.photo.uri }}
              style={styles.heroImage}
              contentFit="contain"
              accessibilityIgnoresInvertColors
            />
            {record.text.trim() ? (
              <Text style={styles.caption} numberOfLines={8}>
                {record.text.trim()}
              </Text>
            ) : null}
          </>
        ) : null}

        {stepKind === 'video' && record.media.video?.uri ? (
          <>
            <Video
              ref={videoPlayback.videoRef}
              style={styles.heroVideo}
              source={{ uri: record.media.video.uri }}
              useNativeControls={false}
              resizeMode={ResizeMode.CONTAIN}
              isLooping={false}
              isMuted={false}
              onPlaybackStatusUpdate={videoPlayback.onPlaybackStatusUpdate}
              onLoad={() => void videoPlayback.applyVideoVolume()}
            />
            <View style={styles.videoControls}>
              <Pressable
                style={styles.audioPlay}
                onPress={() => void videoPlayback.togglePlayPause()}
                accessibilityLabel={videoPlayback.isPlaying ? 'Pause video' : 'Play video'}>
                <Text style={styles.audioPlayIcon}>{videoPlayback.isPlaying ? '❚❚' : '▶'}</Text>
              </Pressable>
              <Text style={styles.audioDuration}>
                {formatSkywriteAudioDuration(videoPlayback.positionMs)} /{' '}
                {formatSkywriteAudioDuration(
                  videoPlayback.durationMs || record.media.video.durationMs,
                )}
              </Text>
              <Pressable
                onPress={videoPlayback.toggleMute}
                accessibilityLabel={videoPlayback.muted ? 'Unmute' : 'Mute'}>
                <Text style={styles.muteText}>{videoPlayback.muted ? 'Unmute' : 'Mute'}</Text>
              </Pressable>
            </View>
            {showVideoVoiceover ? (
              <Text style={styles.caption}>Voiceover plays with this video.</Text>
            ) : null}
            {record.text.trim() ? (
              <Text style={styles.caption} numberOfLines={6}>
                {record.text.trim()}
              </Text>
            ) : null}
          </>
        ) : null}

        {stepKind === 'audio' && audioUri ? (
          <View style={styles.audioBlock}>
            <Pressable
              style={styles.audioPlay}
              onPress={() => onToggleAudio(previewId, audioUri)}
              accessibilityLabel={audioPlaying ? 'Pause' : 'Play voice'}>
              <Text style={styles.audioPlayIcon}>{audioPlaying ? '❚❚' : '▶'}</Text>
            </Pressable>
            <SkywriteAudioWaveform active={audioPlaying} seed={record.id.length} barCount={18} />
            <Text style={styles.audioDuration}>
              {formatSkywriteAudioDuration(record.media.audio?.durationMs)}
            </Text>
            {record.text.trim() ? <Text style={styles.caption}>{record.text.trim()}</Text> : null}
          </View>
        ) : null}
      </View>

      <View style={styles.controls}>
        <Pressable
          disabled={!canPrevious}
          onPress={handlePrevious}
          style={[styles.navBtn, !canPrevious && styles.navDisabled]}>
          <Text style={styles.navText}>{SkywritePlayCopy.previous}</Text>
        </Pressable>
        <Pressable
          disabled={!canNext}
          onPress={handleNext}
          style={[styles.navBtn, !canNext && styles.navDisabled]}>
          <Text style={styles.navText}>{SkywritePlayCopy.next}</Text>
        </Pressable>
      </View>
    </>
  );
}

export const SkywriteImmersiveMomentView = memo(SkywriteImmersiveMomentViewComponent);

const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  exitText: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    fontWeight: '600',
    color: '#E8C872',
  },
  progress: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(248,244,236,0.65)',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.md,
  },
  bodyText: {
    fontFamily: Fonts.serif,
    fontSize: 24,
    lineHeight: 34,
    color: '#FFF8F0',
    textAlign: 'center',
    paddingHorizontal: Spacing.sm,
  },
  heroImage: {
    width: '100%',
    flex: 1,
    maxHeight: 480,
    borderRadius: Radius.lg,
  },
  heroVideo: {
    width: '100%',
    aspectRatio: 9 / 16,
    maxHeight: 480,
    borderRadius: Radius.lg,
    backgroundColor: '#000',
  },
  videoControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
    flexWrap: 'wrap',
  },
  muteText: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(248,244,236,0.75)',
    minHeight: 44,
    textAlignVertical: 'center',
  },
  caption: {
    fontFamily: Fonts.sans,
    fontSize: 15,
    lineHeight: 22,
    color: 'rgba(248,244,236,0.88)',
    textAlign: 'center',
    paddingHorizontal: Spacing.md,
  },
  audioBlock: {
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(167, 139, 250, 0.28)',
    backgroundColor: 'rgba(8, 10, 28, 0.55)',
  },
  audioPlay: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(232, 200, 114, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(232, 200, 114, 0.14)',
  },
  audioPlayIcon: {
    fontSize: 18,
    color: '#E8C872',
    fontWeight: '700',
  },
  audioDuration: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    color: 'rgba(248,244,236,0.65)',
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: Spacing.md,
    gap: 8,
  },
  navBtn: {
    minHeight: 44,
    minWidth: 88,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  navDisabled: { opacity: 0.35 },
  navText: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    fontWeight: '700',
    color: '#E8C872',
  },
});
