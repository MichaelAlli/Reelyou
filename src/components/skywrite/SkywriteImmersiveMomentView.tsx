import { ResizeMode, Video } from 'expo-av';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { memo, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import type { SkywriteFramedVideoLayerRef } from '@/components/skywrite/SkywriteFramedVideoLayer';
import {
  SkywriteFramedVideoLayer,
  SkywriteFramingToolbar,
} from '@/components/skywrite/SkywriteFramedVideoLayer';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type LayoutChangeEvent,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SkywriteAudioMixBottomSheet } from '@/components/skywrite/SkywriteAudioMixBottomSheet';
import { SkywriteAudioWaveform } from '@/components/skywrite/SkywriteAudioWaveform';
import { SkywritePlayCopy } from '@/constants/skywritePlayCopy';
import { getSkywriteWriteInputStyle } from '@/constants/skywriteTextStyles';
import { Fonts, Spacing } from '@/constants/theme';
import { formatSkywriteAudioDuration } from '@/skywrite/media/skywriteMediaPreviewUtils';
import {
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
  onBeforeStepChange?: () => void;
  autoPlayVideo?: boolean;
  layoutMode?: 'standard' | 'viewport';
  mediaMix?: SkywriteMedia;
  onMediaMixChange?: (media: SkywriteMedia) => void;
  showAudioMixControls?: boolean;
  commentsSlot?: ReactNode;
  onVideoFinished?: () => void;
  sequencePaused?: boolean;
  onVideoAutoplayBlocked?: () => void;
  manualPlayNonce?: number;
  bottomSlot?: ReactNode;
  tapToPlayPrompt?: boolean;
  onTapToPlayContinue?: () => void;
  onToggleSequencePause?: () => void;
  /** Compose / preview before post — pan framing + fit/fill. */
  allowVideoFramingEdit?: boolean;
}

function ProgressSegments({ index, count }: { index: number; count: number }) {
  if (count <= 1) return null;
  return (
    <View style={styles.segments}>
      {Array.from({ length: count }).map((_, i) => (
        <View
          key={`seg-${i}`}
          style={[styles.segment, i <= index ? styles.segmentActive : styles.segmentIdle]}
        />
      ))}
    </View>
  );
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
  bottomSlot,
  tapToPlayPrompt = false,
  onTapToPlayContinue,
  onToggleSequencePause,
  allowVideoFramingEdit = false,
}: SkywriteImmersiveMomentViewProps) {
  const insets = useSafeAreaInsets();
  const videoActive = stepKind === 'video' && Boolean(record.media.video?.uri);
  const playbackMedia = mediaMix ?? record.media;
  const displayVideo = playbackMedia.video ?? record.media.video;
  const framingLayerRef = useRef<SkywriteFramedVideoLayerRef>(null);
  const videoPlayback = useSkywriteImmersiveVideoPlayback(record, videoActive, playbackMedia, {
    onAutoplayBlocked: onVideoAutoplayBlocked,
  });
  const { requestAutoPlay, cleanup: cleanupVideo, handleVideoLoad, naturalSize } = videoPlayback;
  const autoPlayIssuedRef = useRef(false);
  const [mixOpen, setMixOpen] = useState(false);

  const onStageLayout = (_event: LayoutChangeEvent) => {
    /* stage is always full bleed in viewport mode */
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
  const videoAspect = useMemo(() => {
    if (naturalSize?.width && naturalSize.height) {
      return naturalSize.width / naturalSize.height;
    }
    return skywriteVideoAspectRatio(record.media.video?.width, record.media.video?.height);
  }, [naturalSize, record.media.video?.height, record.media.video?.width]);

  const showMixSheet =
    showAudioMixControls &&
    Boolean(onMediaMixChange) &&
    stepKind === 'video' &&
    (Boolean(playbackMedia.video?.uri) || Boolean(playbackMedia.audio?.uri));

  const canEditFraming = allowVideoFramingEdit && Boolean(onMediaMixChange) && Boolean(displayVideo);

  const patchDisplayVideo = (patch: Partial<NonNullable<typeof displayVideo>>) => {
    if (!displayVideo || !onMediaMixChange) return;
    onMediaMixChange({
      ...playbackMedia,
      video: { ...displayVideo, ...patch },
    });
  };

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
    setMixOpen(false);
    void cleanupVideo();
    onExit();
  };

  const renderStandardLayout = () => (
    <View style={styles.root}>
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
          <Image source={{ uri: record.media.photo.uri }} style={styles.heroImage} contentFit="contain" />
        ) : null}
        {stepKind === 'video' && record.media.video?.uri ? (
          <View style={styles.videoStageStandard}>
            <View style={skywriteVideoFrameStyle(videoAspect, 480)}>
              <Video
                ref={videoPlayback.videoRef}
                style={skywriteVideoElementStyle()}
                source={{ uri: record.media.video.uri }}
                resizeMode={ResizeMode.CONTAIN}
                useNativeControls={false}
                isLooping={false}
                onPlaybackStatusUpdate={videoPlayback.onPlaybackStatusUpdate}
                onLoad={(status) => {
                  handleVideoLoad(status);
                  if (autoPlayVideo) requestAutoPlay();
                }}
              />
            </View>
          </View>
        ) : null}
        {stepKind === 'audio' && audioUri ? (
          <Pressable onPress={() => onToggleAudio(previewId, audioUri)}>
            <Text style={styles.exitText}>{audioPlaying ? 'Pause' : 'Play'} voice</Text>
          </Pressable>
        ) : null}
      </View>
      <View style={styles.controls}>
        <Pressable disabled={!canPrevious} onPress={handlePrevious} style={styles.navBtn}>
          <Text style={styles.navText}>{SkywritePlayCopy.previous}</Text>
        </Pressable>
        <Pressable disabled={!canNext} onPress={handleNext} style={styles.navBtn}>
          <Text style={styles.navText}>{SkywritePlayCopy.next}</Text>
        </Pressable>
      </View>
    </View>
  );

  if (layoutMode !== 'viewport') {
    return renderStandardLayout();
  }

  return (
    <View style={styles.immersiveRoot}>
      <View style={styles.immersiveStage} onLayout={onStageLayout}>
        {stepKind === 'video' && displayVideo?.uri ? (
          <SkywriteFramedVideoLayer
            ref={framingLayerRef}
            video={displayVideo}
            aspectRatio={videoAspect}
            editable={canEditFraming}
            onVideoPatch={patchDisplayVideo}
            videoRef={videoPlayback.videoRef}
            isPlaying={videoPlayback.isPlaying}
            onPauseForAdjust={async () => {
              if (videoPlayback.isPlaying) await videoPlayback.togglePlayPause();
            }}
            onResumeAfterAdjust={async (wasPlaying) => {
              if (wasPlaying) await videoPlayback.togglePlayPause();
            }}
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
        ) : null}

        {stepKind === 'photo' && record.media.photo?.uri ? (
          <Image
            source={{ uri: record.media.photo.uri }}
            style={StyleSheet.absoluteFill}
            contentFit="contain"
            accessibilityIgnoresInvertColors
          />
        ) : null}

        {stepKind === 'text' ? (
          <View style={styles.textStage}>
            <Text style={[styles.bodyTextImmersive, getSkywriteWriteInputStyle(record.textStyle)]}>
              {record.text.trim() || '…'}
            </Text>
          </View>
        ) : null}

        {stepKind === 'audio' && audioUri ? (
          <View style={styles.audioStage}>
            <SkywriteAudioWaveform active={audioPlaying} seed={record.id.length} barCount={22} />
          </View>
        ) : null}
      </View>

      <LinearGradient
        colors={['rgba(5, 5, 8, 0.82)', 'rgba(5, 5, 8, 0.35)', 'transparent']}
        style={[styles.topGradient, { paddingTop: insets.top + 6 }]}
        pointerEvents="box-none">
        <View style={styles.topRow}>
          <Pressable
            onPress={handleExit}
            hitSlop={12}
            accessibilityLabel={SkywritePlayCopy.exitPlay}
            style={styles.closeBtn}>
            <Text style={styles.closeIcon}>✕</Text>
          </Pressable>
          <ProgressSegments index={stepIndex} count={stepCount} />
          <Text style={styles.progressCompact}>
            {SkywritePlayCopy.progress(stepIndex + 1, stepCount)}
          </Text>
        </View>
        {tapToPlayPrompt ? (
          <Pressable style={styles.tapBanner} onPress={onTapToPlayContinue}>
            <Text style={styles.tapBannerText}>{SkywritePlayCopy.tapToPlaySky}</Text>
          </Pressable>
        ) : null}
      </LinearGradient>

      <LinearGradient
        colors={['transparent', 'rgba(5, 5, 8, 0.55)', 'rgba(5, 5, 8, 0.92)']}
        style={[styles.bottomGradient, { paddingBottom: Math.max(insets.bottom, 10) }]}
        pointerEvents="box-none">
        {record.text.trim() && stepKind !== 'text' ? (
          <Text style={styles.captionOverlay} numberOfLines={3}>
            {record.text.trim()}
          </Text>
        ) : null}

        {stepKind === 'video' && displayVideo?.uri ? (
          <>
            {canEditFraming ? (
              <SkywriteFramingToolbar
                video={displayVideo}
                editable
                onVideoPatch={patchDisplayVideo}
                onRequestAdjust={() => framingLayerRef.current?.beginAdjust()}
              />
            ) : null}
          <View style={styles.videoToolbar}>
            <Pressable
              style={styles.playChip}
              onPress={() => void videoPlayback.togglePlayPause()}
              accessibilityLabel={videoPlayback.isPlaying ? 'Pause video' : 'Play video'}>
              <Text style={styles.playIcon}>{videoPlayback.isPlaying ? '❚❚' : '▶'}</Text>
            </Pressable>
            <Text style={styles.timeLabel}>
              {formatSkywriteAudioDuration(videoPlayback.positionMs)} /{' '}
              {formatSkywriteAudioDuration(
                videoPlayback.durationMs || displayVideo.durationMs,
              )}
            </Text>
            {showMixSheet ? (
              <Pressable
                style={styles.toolbarChip}
                onPress={() => setMixOpen(true)}
                accessibilityLabel="Audio mix">
                <Text style={styles.toolbarChipText}>Audio mix</Text>
              </Pressable>
            ) : null}
            {onToggleSequencePause ? (
              <Pressable style={styles.toolbarChip} onPress={onToggleSequencePause}>
                <Text style={styles.toolbarChipText}>
                  {sequencePaused ? SkywritePlayCopy.resume : SkywritePlayCopy.pause}
                </Text>
              </Pressable>
            ) : null}
          </View>
          </>
        ) : null}

        {stepKind === 'audio' && audioUri ? (
          <View style={styles.videoToolbar}>
            <Pressable
              style={styles.playChip}
              onPress={() => onToggleAudio(previewId, audioUri)}
              accessibilityLabel={audioPlaying ? 'Pause voice' : 'Play voice'}>
              <Text style={styles.playIcon}>{audioPlaying ? '❚❚' : '▶'}</Text>
            </Pressable>
            <Text style={styles.timeLabel}>
              {formatSkywriteAudioDuration(record.media.audio?.durationMs)}
            </Text>
          </View>
        ) : null}

        <View style={styles.navRow}>
          <Pressable
            disabled={!canPrevious}
            onPress={handlePrevious}
            style={[styles.navBtnOverlay, !canPrevious && styles.navDisabled]}>
            <Text style={styles.navText}>{SkywritePlayCopy.previous}</Text>
          </Pressable>
          <Pressable
            disabled={!canNext}
            onPress={handleNext}
            style={[styles.navBtnOverlay, !canNext && styles.navDisabled]}>
            <Text style={styles.navText}>{SkywritePlayCopy.next}</Text>
          </Pressable>
        </View>

        {commentsSlot ? (
          <ScrollView
            style={styles.commentsPeek}
            contentContainerStyle={styles.commentsPeekContent}
            keyboardShouldPersistTaps="handled">
            {commentsSlot}
          </ScrollView>
        ) : null}

        {bottomSlot ? <View style={styles.bottomSlot}>{bottomSlot}</View> : null}
      </LinearGradient>

      {showMixSheet && onMediaMixChange ? (
        <SkywriteAudioMixBottomSheet
          visible={mixOpen}
          media={playbackMedia}
          onChange={onMediaMixChange}
          onClose={() => setMixOpen(false)}
        />
      ) : null}
    </View>
  );
}

export const SkywriteImmersiveMomentView = memo(SkywriteImmersiveMomentViewComponent);

const styles = StyleSheet.create({
  root: { width: '100%' },
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
  },
  videoStageStandard: { width: '100%' },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: Spacing.md,
  },
  navBtn: { minHeight: 44, minWidth: 88, justifyContent: 'center', alignItems: 'center' },
  navText: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    fontWeight: '700',
    color: '#E8C872',
  },
  immersiveRoot: {
    flex: 1,
    minHeight: 0,
    backgroundColor: '#050508',
    position: 'relative',
  },
  immersiveStage: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#050508',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textStage: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    width: '100%',
  },
  bodyTextImmersive: {
    fontFamily: Fonts.serif,
    fontSize: 26,
    lineHeight: 36,
    color: '#FFF8F0',
    textAlign: 'center',
  },
  audioStage: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    width: '100%',
  },
  topGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 12,
    paddingBottom: 28,
    zIndex: 2,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minHeight: 44,
  },
  closeBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeIcon: {
    color: '#FFF8F0',
    fontSize: 20,
    fontWeight: '600',
  },
  segments: {
    flex: 1,
    flexDirection: 'row',
    gap: 4,
    alignItems: 'center',
  },
  segment: {
    flex: 1,
    height: 2,
    borderRadius: 1,
  },
  segmentActive: { backgroundColor: 'rgba(255, 248, 240, 0.95)' },
  segmentIdle: { backgroundColor: 'rgba(255, 248, 240, 0.28)' },
  progressCompact: {
    fontFamily: Fonts.sans,
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(248,244,236,0.75)',
    minWidth: 36,
    textAlign: 'right',
  },
  tapBanner: {
    marginTop: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: 'rgba(232, 200, 114, 0.18)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(232, 200, 114, 0.4)',
  },
  tapBannerText: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    fontWeight: '600',
    color: '#E8C872',
    textAlign: 'center',
  },
  bottomGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 12,
    paddingTop: 48,
    zIndex: 2,
  },
  captionOverlay: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    lineHeight: 20,
    color: 'rgba(248,244,236,0.92)',
    textAlign: 'center',
    marginBottom: 10,
  },
  videoToolbar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  playChip: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(232, 200, 114, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(232, 200, 114, 0.16)',
  },
  playIcon: { color: '#E8C872', fontSize: 16, fontWeight: '700' },
  timeLabel: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    color: 'rgba(248, 244, 236, 0.78)',
    flexShrink: 1,
  },
  toolbarChip: {
    minHeight: 36,
    paddingHorizontal: 12,
    justifyContent: 'center',
    borderRadius: 999,
    backgroundColor: 'rgba(8, 10, 28, 0.55)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(167, 139, 250, 0.35)',
  },
  toolbarChipText: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    fontWeight: '600',
    color: '#E8C872',
  },
  navRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  navBtnOverlay: {
    minHeight: 44,
    minWidth: 88,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  navDisabled: { opacity: 0.35 },
  commentsPeek: { maxHeight: 100, marginBottom: 6 },
  commentsPeekContent: { paddingBottom: 4 },
  bottomSlot: { marginTop: 4 },
});
