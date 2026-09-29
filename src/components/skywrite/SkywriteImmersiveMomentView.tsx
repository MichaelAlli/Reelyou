import { ResizeMode, Video } from 'expo-av';
import { Image } from 'expo-image';
import { memo, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
  type LayoutChangeEvent,
  type ViewStyle,
} from 'react-native';

import { SkywriteAudioWaveform } from '@/components/skywrite/SkywriteAudioWaveform';
import { SkywritePlaybackAudioMixControls } from '@/components/skywrite/SkywritePlaybackAudioMixControls';
import { SkywritePlayCopy } from '@/constants/skywritePlayCopy';
import { getSkywriteWriteInputStyle } from '@/constants/skywriteTextStyles';
import { Fonts, Radius, Spacing } from '@/constants/theme';
import { formatSkywriteAudioDuration } from '@/skywrite/media/skywriteMediaPreviewUtils';
import {
  measureContainedVideoFrame,
  skywriteContainedVideoFrameStyle,
  skywriteVideoAspectRatio,
  skywriteVideoElementStyle,
  skywriteVideoFrameStyle,
} from '@/skywrite/media/skywriteVideoLayout';
import { useSkywriteImmersiveVideoPlayback } from '@/skywrite/media/useSkywriteImmersiveVideoPlayback';
import type { SkywritePlayStepKind } from '@/skywrite/play/skywritePlayTypes';
import type { SkywriteMedia, SkywriteRecord } from '@/skywrite/types';

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
  /** When true, starts video playback once the asset is loaded (library open flow). */
  autoPlayVideo?: boolean;
  /** Large contain-fit layout for compose preview and full-screen playback. */
  layoutMode?: 'standard' | 'viewport';
  /** Live mix levels during compose preview (persisted on the draft). */
  mediaMix?: SkywriteMedia;
  onMediaMixChange?: (media: SkywriteMedia) => void;
  showAudioMixControls?: boolean;
  commentsSlot?: ReactNode;
  onVideoFinished?: () => void;
  sequencePaused?: boolean;
  onVideoAutoplayBlocked?: () => void;
  manualPlayNonce?: number;
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
  autoPlayVideo = false,
  layoutMode = 'standard',
  mediaMix,
  onMediaMixChange,
  showAudioMixControls = false,
  commentsSlot,
  onVideoFinished,
  sequencePaused = false,
  onVideoAutoplayBlocked,
  manualPlayNonce = 0,
}: SkywriteImmersiveMomentViewProps) {
  const videoActive = stepKind === 'video' && Boolean(record.media.video?.uri);
  const playbackMedia = mediaMix ?? record.media;
  const videoPlayback = useSkywriteImmersiveVideoPlayback(record, videoActive, playbackMedia, {
    onAutoplayBlocked: onVideoAutoplayBlocked,
  });
  const { requestAutoPlay, cleanup: cleanupVideo, handleVideoLoad, naturalSize } = videoPlayback;
  const autoPlayIssuedRef = useRef(false);
  const [stageSize, setStageSize] = useState({ width: 0, height: 0 });
  const [videoFullscreen, setVideoFullscreen] = useState(false);
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();

  const onStageLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setStageSize({ width, height });
  };

  useEffect(() => {
    autoPlayIssuedRef.current = false;
  }, [record.id, stepKind]);

  useEffect(() => {
    if (!autoPlayVideo || stepKind !== 'video' || autoPlayIssuedRef.current || sequencePaused) return;
    autoPlayIssuedRef.current = true;
    requestAutoPlay();
  }, [autoPlayVideo, sequencePaused, stepKind, record.id, requestAutoPlay]);

  useEffect(() => {
    if (!manualPlayNonce || stepKind !== 'video') return;
    autoPlayIssuedRef.current = true;
    requestAutoPlay();
  }, [manualPlayNonce, requestAutoPlay, stepKind]);

  useEffect(() => {
    if (stepKind !== 'video') return;
    if (sequencePaused && videoPlayback.isPlaying) {
      void videoPlayback.togglePlayPause();
      return;
    }
    if (!sequencePaused && autoPlayVideo && !videoPlayback.isPlaying && videoPlayback.isLoaded) {
      requestAutoPlay();
    }
  }, [
    autoPlayVideo,
    sequencePaused,
    stepKind,
    videoPlayback,
    videoPlayback.isLoaded,
    videoPlayback.isPlaying,
    requestAutoPlay,
  ]);

  const audioUri = record.media.audio?.uri ?? null;
  const showVideoVoiceover =
    record.mediaMode === 'video_voiceover' && stepKind === 'video' && Boolean(audioUri);

  const videoAspect = useMemo(() => {
    if (naturalSize?.width && naturalSize.height) {
      return naturalSize.width / naturalSize.height;
    }
    return skywriteVideoAspectRatio(
      record.media.video?.width,
      record.media.video?.height,
    );
  }, [naturalSize, record.media.video?.height, record.media.video?.width]);

  const videoFrameStyle = useMemo(() => {
    if (layoutMode === 'viewport' && stageSize.width > 0 && stageSize.height > 0) {
      return skywriteContainedVideoFrameStyle(
        videoAspect,
        stageSize.width,
        stageSize.height,
      );
    }
    return skywriteVideoFrameStyle(videoAspect, layoutMode === 'viewport' ? 720 : 480);
  }, [layoutMode, stageSize.height, stageSize.width, videoAspect]);

  const showMixControls =
    showAudioMixControls &&
    Boolean(onMediaMixChange) &&
    stepKind === 'video' &&
    (Boolean(playbackMedia.video?.uri) || Boolean(playbackMedia.audio?.uri));

  const handlePrevious = () => {
    onBeforeStepChange?.();
    void cleanupVideo();
    onPrevious();
  };

  const handleNext = () => {
    onBeforeStepChange?.();
    void cleanupVideo();
    onNext();
  };

  const handleExit = () => {
    onBeforeStepChange?.();
    setVideoFullscreen(false);
    void cleanupVideo();
    onExit();
  };

  const renderVideoPlayer = (frameStyle: ViewStyle) => (
    <View style={frameStyle}>
      <Video
        ref={videoPlayback.videoRef}
        style={skywriteVideoElementStyle()}
        source={{ uri: record.media.video!.uri }}
        useNativeControls={false}
        resizeMode={ResizeMode.CONTAIN}
        isLooping={false}
        isMuted={false}
        progressUpdateIntervalMillis={250}
        onPlaybackStatusUpdate={(status) => {
          videoPlayback.onPlaybackStatusUpdate(status);
          if (status.isLoaded && status.didJustFinish) {
            onVideoFinished?.();
          }
        }}
        onLoad={(status) => {
          handleVideoLoad(status);
          if (autoPlayVideo) requestAutoPlay();
        }}
      />
      {!videoFullscreen ? (
        <Pressable
          style={styles.expandBtn}
          accessibilityLabel="Expand video"
          onPress={() => setVideoFullscreen(true)}>
          <Text style={styles.expandBtnText}>⛶</Text>
        </Pressable>
      ) : null}
    </View>
  );

  const fullscreenStageSize = useMemo(() => {
    const padV = 120;
    const padH = 16;
    return measureContainedVideoFrame(
      videoAspect,
      Math.max(1, windowWidth - padH * 2),
      Math.max(1, windowHeight - padV),
    );
  }, [videoAspect, windowHeight, windowWidth]);

  return (
    <View style={[styles.root, layoutMode === 'viewport' && styles.rootViewport]}>
      <View style={styles.topBar}>
        <Pressable onPress={handleExit} accessibilityLabel={SkywritePlayCopy.exitPlay}>
          <Text style={styles.exitText}>{SkywritePlayCopy.exitPlay}</Text>
        </Pressable>
        <Text style={styles.progress}>{SkywritePlayCopy.progress(stepIndex + 1, stepCount)}</Text>
      </View>

      <View style={[styles.content, layoutMode === 'viewport' && styles.contentViewport]}>
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
            <View
              style={[
                layoutMode === 'viewport' ? styles.videoStageViewport : styles.videoStageStandard,
                layoutMode === 'viewport' && styles.videoStageFill,
                videoFullscreen && styles.videoStageFullscreen,
              ]}
              onLayout={layoutMode === 'viewport' ? onStageLayout : undefined}>
              {renderVideoPlayer(
                videoFullscreen
                  ? {
                      width: fullscreenStageSize.width,
                      height: fullscreenStageSize.height,
                      alignSelf: 'center',
                      backgroundColor: '#050508',
                      borderRadius: Radius.lg,
                      overflow: 'hidden',
                    }
                  : videoFrameStyle,
              )}
            </View>
            <Modal
              visible={videoFullscreen}
              transparent
              animationType="fade"
              onRequestClose={() => setVideoFullscreen(false)}>
              <Pressable style={styles.fullscreenBackdrop} onPress={() => setVideoFullscreen(false)} />
              <View style={styles.fullscreenControlsOverlay} pointerEvents="box-none">
                <View style={styles.fullscreenControls}>
                  <Pressable onPress={() => setVideoFullscreen(false)}>
                    <Text style={styles.exitText}>Close</Text>
                  </Pressable>
                  <Pressable onPress={() => void videoPlayback.togglePlayPause()}>
                    <Text style={styles.muteText}>
                      {videoPlayback.isPlaying ? 'Pause' : 'Play'}
                    </Text>
                  </Pressable>
                  <Pressable onPress={videoPlayback.toggleMute}>
                    <Text style={styles.muteText}>{videoPlayback.muted ? 'Unmute' : 'Mute'}</Text>
                  </Pressable>
                </View>
              </View>
            </Modal>
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
            {showMixControls ? (
              <SkywritePlaybackAudioMixControls
                compact={layoutMode === 'viewport'}
                collapsible
                media={playbackMedia}
                onChange={(next) => onMediaMixChange?.(next)}
              />
            ) : showVideoVoiceover && !showMixControls ? (
              <Text style={styles.caption}>Voiceover plays with this video.</Text>
            ) : null}
            {record.text.trim() ? (
              <Text style={styles.caption} numberOfLines={layoutMode === 'viewport' ? 3 : 6}>
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

      {commentsSlot ? (
        <ScrollView
          style={styles.commentsScroll}
          contentContainerStyle={styles.commentsScrollContent}
          keyboardShouldPersistTaps="handled">
          {commentsSlot}
        </ScrollView>
      ) : null}

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
    </View>
  );
}

export const SkywriteImmersiveMomentView = memo(SkywriteImmersiveMomentViewComponent);

const styles = StyleSheet.create({
  root: {
    width: '100%',
  },
  rootViewport: {
    flex: 1,
    minHeight: 0,
    position: 'relative',
  },
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
  contentViewport: {
    justifyContent: 'flex-start',
    gap: Spacing.sm,
    paddingVertical: Spacing.xs,
    minHeight: 0,
  },
  videoStageStandard: {
    width: '100%',
  },
  videoStageViewport: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  videoStageFill: {
    flex: 1,
    minHeight: 220,
  },
  expandBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(8, 10, 28, 0.72)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(232, 200, 114, 0.35)',
  },
  expandBtnText: {
    color: '#E8C872',
    fontSize: 16,
    fontWeight: '700',
  },
  videoStageFullscreen: {
    ...StyleSheet.absoluteFill,
    zIndex: 50,
    backgroundColor: '#050508',
    paddingTop: 48,
    paddingBottom: 72,
    paddingHorizontal: 8,
  },
  fullscreenBackdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(5, 5, 8, 0.92)',
  },
  fullscreenControlsOverlay: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'flex-end',
    paddingBottom: 32,
    paddingHorizontal: 16,
  },
  fullscreenControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  commentsScroll: {
    maxHeight: 220,
    marginTop: 4,
  },
  commentsScrollContent: {
    paddingBottom: 4,
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
