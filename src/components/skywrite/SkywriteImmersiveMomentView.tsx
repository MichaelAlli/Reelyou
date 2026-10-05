import { ResizeMode, Video } from 'expo-av';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
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
import {
  formatSkywriteAudioDuration,
  formatSkywritePlaybackDurationLabel,
} from '@/skywrite/media/skywriteMediaPreviewUtils';
import { resolveCombinedTimelineMs } from '@/skywrite/media/skywritePlaybackTime';
import {
  skywriteVideoAspectRatio,
  skywriteVideoElementStyle,
  skywriteVideoFrameStyle,
} from '@/skywrite/media/skywriteVideoLayout';
import { SkywritePlaybackSeekBar } from '@/components/skywrite/SkywritePlaybackSeekBar';
import { SkywritePlayEdgeNavigation } from '@/components/skywrite/SkywritePlayEdgeNavigation';
import { useSkywriteImmersiveVideoPlayback } from '@/skywrite/media/useSkywriteImmersiveVideoPlayback';
import { useSkywriteNarrationPlayback } from '@/skywrite/media/useSkywriteNarrationPlayback';
import type { SkywritePlayStepKind } from '@/skywrite/play/skywritePlayTypes';
import { useResolvedSkywriteRecord } from '@/social/useResolvedSkywriteRecord';
import type { SkywriteMedia, SkywriteRecord } from '@/skywrite/types';
import { formatSkyReelRemainingLabel } from '@/skywrite/play/skyReelExpiry';
import { stepUsesAttachedVoiceover } from '@/skywrite/voiceoverStepUtils';

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
  /** Skyreel uses edge taps; compose preview keeps visible nav buttons. */
  navigationMode?: 'edgeTap' | 'buttons';
  onNarrationFinished?: () => void;
  narrationAutoplay?: boolean;
  narrationPaused?: boolean;
  /** Bumps when user taps to start or changes Skyreel item — restarts narration. */
  mediaStartNonce?: number;
  /** Bumped when SkyReel navigation changes — cancels stale narration completion. */
  playSessionId?: number;
  skyReelActiveUntilMs?: number | null;
  /** When false, hide SkyReel window countdown (e.g. single-post saved playback). */
  showSkyReelExpiry?: boolean;
  onMediaPlaybackStarted?: () => void;
  /** Compose preview: stop video + narration when Back to editing bypasses handleExit. */
  onRegisterMediaStop?: (stop: () => void) => void;
  /** Compose preview: seek bar + replay without changing SkyReel chrome. */
  enablePreviewPlaybackChrome?: boolean;
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
  navigationMode = 'edgeTap',
  onNarrationFinished,
  narrationAutoplay = false,
  narrationPaused = false,
  mediaStartNonce = 0,
  playSessionId = 0,
  skyReelActiveUntilMs = null,
  showSkyReelExpiry = true,
  onMediaPlaybackStarted,
  onRegisterMediaStop,
  enablePreviewPlaybackChrome = false,
}: SkywriteImmersiveMomentViewProps) {
  const insets = useSafeAreaInsets();
  const { record: resolvedRecord, status: remoteMediaStatus, mediaError, retry: retryRemoteMedia } =
    useResolvedSkywriteRecord(record);
  const playbackRecord = resolvedRecord ?? record;
  const videoActive = stepKind === 'video' && Boolean(playbackRecord.media.video?.uri);
  const playbackMedia = mediaMix ?? playbackRecord.media;
  const displayVideo = playbackMedia.video ?? playbackRecord.media.video;
  const framingLayerRef = useRef<SkywriteFramedVideoLayerRef>(null);
  const attachedVoiceover = stepUsesAttachedVoiceover(playbackRecord, stepKind);
  const narrationActive =
    attachedVoiceover && (stepKind === 'text' || stepKind === 'photo') && Boolean(playbackMedia.audio?.uri);
  const narration = useSkywriteNarrationPlayback(narrationActive, playSessionId);
  const narrationStartedRef = useRef(false);
  const narrationSessionRef = useRef(0);
  const playSessionIdRef = useRef(playSessionId);
  playSessionIdRef.current = playSessionId;
  const autoPlayBlockedRef = useRef(false);
  const narrationHintTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [narrationNeedsUserStart, setNarrationNeedsUserStart] = useState(false);
  const [narrationCenterHint, setNarrationCenterHint] = useState<string | null>(null);

  const flashNarrationHint = useCallback((text: string) => {
    setNarrationCenterHint(text);
    if (narrationHintTimerRef.current) clearTimeout(narrationHintTimerRef.current);
    narrationHintTimerRef.current = setTimeout(() => setNarrationCenterHint(null), 1600);
  }, []);

  const handleVideoAutoplayBlocked = useCallback(() => {
    autoPlayBlockedRef.current = true;
    onVideoAutoplayBlocked?.();
  }, [onVideoAutoplayBlocked]);

  const videoPlaybackOptions = useMemo(
    () => ({
      onAutoplayBlocked: handleVideoAutoplayBlocked,
      onCombinedPlaybackFinished: onVideoFinished,
      onPlaybackStarted: onMediaPlaybackStarted,
    }),
    [handleVideoAutoplayBlocked, onMediaPlaybackStarted, onVideoFinished],
  );
  const videoPlayback = useSkywriteImmersiveVideoPlayback(
    playbackRecord,
    videoActive,
    playbackMedia,
    videoPlaybackOptions,
  );
  const {
    requestAutoPlay,
    cleanup: cleanupVideo,
    handleVideoLoad,
    naturalSize,
    seekTo,
    togglePlayPause,
    beginScrub,
    scrubTo,
    endScrub,
    replay: replayVideo,
    playbackPhase,
    combinedDurationMs,
  } = videoPlayback;
  const stopVideoAndNarration = useCallback(() => {
    void cleanupVideo();
    void narration.stop();
  }, [cleanupVideo, narration]);

  useEffect(() => {
    onRegisterMediaStop?.(stopVideoAndNarration);
  }, [onRegisterMediaStop, stopVideoAndNarration]);
  const autoPlayIssuedRef = useRef(false);
  const prevRemoteMediaStatusRef = useRef(remoteMediaStatus);
  const [mixOpen, setMixOpen] = useState(false);
  const [framingAdjustActive, setFramingAdjustActive] = useState(false);
  const [expiryTick, setExpiryTick] = useState(0);

  useEffect(() => {
    if (skyReelActiveUntilMs == null) return;
    const timer = setInterval(() => setExpiryTick((t) => t + 1), 30_000);
    return () => clearInterval(timer);
  }, [skyReelActiveUntilMs]);

  const onStageLayout = (_event: LayoutChangeEvent) => {
    /* stage is always full bleed in viewport mode */
  };

  useEffect(() => {
    autoPlayIssuedRef.current = false;
    autoPlayBlockedRef.current = false;
    narrationStartedRef.current = false;
    setNarrationNeedsUserStart(false);
    setNarrationCenterHint(null);
    stopVideoAndNarration();
  }, [record.id, stepKind, mediaStartNonce, playSessionId, stopVideoAndNarration]);

  useEffect(
    () => () => {
      if (narrationHintTimerRef.current) clearTimeout(narrationHintTimerRef.current);
    },
    [],
  );

  useEffect(() => {
    const prev = prevRemoteMediaStatusRef.current;
    prevRemoteMediaStatusRef.current = remoteMediaStatus;
    if (prev === 'loading' && remoteMediaStatus === 'ready' && stepKind === 'video') {
      autoPlayIssuedRef.current = false;
      if (autoPlayVideo && !sequencePaused) {
        requestAutoPlay();
      }
    }
  }, [autoPlayVideo, remoteMediaStatus, requestAutoPlay, sequencePaused, stepKind]);

  useEffect(() => {
    if (!narrationActive || !narrationAutoplay || narrationPaused || narrationStartedRef.current) return;
    if (remoteMediaStatus === 'loading') return;
    const uri = playbackMedia.audio?.uri;
    if (!uri) return;
    narrationStartedRef.current = true;
    narrationSessionRef.current = playSessionIdRef.current;
    void narration
      .playUri(uri, playbackMedia, () => {
        if (narrationSessionRef.current !== playSessionIdRef.current) return;
        onNarrationFinished?.();
      })
      .then((ok) => {
        if (ok) {
          setNarrationNeedsUserStart(false);
          onMediaPlaybackStarted?.();
        } else {
          setNarrationNeedsUserStart(true);
        }
      });
  }, [
    narration,
    narrationActive,
    narrationAutoplay,
    narrationPaused,
    mediaStartNonce,
    onMediaPlaybackStarted,
    onNarrationFinished,
    playSessionId,
    playbackMedia,
    remoteMediaStatus,
  ]);

  useEffect(() => {
    if (!narrationActive) return;
    if (narrationPaused && narration.isPlaying) void narration.pausePlayback();
  }, [narration, narrationActive, narrationPaused, narration.isPlaying]);

  useEffect(() => {
    if (!narrationActive) return;
    void narration.setVolumeFromMedia(playbackMedia);
  }, [narration, narrationActive, playbackMedia, playbackMedia.voiceoverVolume]);

  useEffect(() => {
    return () => {
      void narration.stop();
    };
  }, [record.id, stepKind, narration.stop]);

  useEffect(() => {
    if (mediaStartNonce <= 0 || stepKind !== 'video') return;
    if (remoteMediaStatus === 'loading') return;
    void seekTo(0);
  }, [mediaStartNonce, remoteMediaStatus, seekTo, stepKind]);

  useEffect(() => {
    if (!autoPlayVideo || stepKind !== 'video' || autoPlayIssuedRef.current || sequencePaused) return;
    if (autoPlayBlockedRef.current) return;
    if (remoteMediaStatus === 'loading') return;
    autoPlayIssuedRef.current = true;
    requestAutoPlay();
  }, [autoPlayVideo, remoteMediaStatus, sequencePaused, stepKind, record.id, requestAutoPlay]);

  useEffect(() => {
    if (!manualPlayNonce || stepKind !== 'video') return;
    autoPlayIssuedRef.current = true;
    requestAutoPlay();
  }, [manualPlayNonce, requestAutoPlay, stepKind]);

  const videoIsPlaying = videoPlayback.isPlaying;
  const videoIsLoaded = videoPlayback.isLoaded;

  useEffect(() => {
    if (stepKind !== 'video' || !sequencePaused || !videoIsPlaying) return;
    void togglePlayPause();
  }, [sequencePaused, stepKind, togglePlayPause, videoIsPlaying]);

  const audioUri = playbackRecord.media.audio?.uri ?? null;
  const videoAspect = useMemo(() => {
    if (naturalSize?.width && naturalSize.height) {
      return naturalSize.width / naturalSize.height;
    }
    return skywriteVideoAspectRatio(record.media.video?.width, record.media.video?.height);
  }, [naturalSize, record.media.video?.height, record.media.video?.width]);

  const showMixSheet =
    showAudioMixControls &&
    Boolean(onMediaMixChange) &&
    (stepKind === 'video'
      ? Boolean(playbackMedia.video?.uri) || Boolean(playbackMedia.audio?.uri)
      : narrationActive && Boolean(playbackMedia.audio?.uri));

  const canEditFraming = allowVideoFramingEdit && Boolean(onMediaMixChange) && Boolean(displayVideo);

  const patchDisplayVideo = (patch: Partial<NonNullable<typeof displayVideo>>) => {
    if (!displayVideo || !onMediaMixChange) return;
    onMediaMixChange({
      ...playbackMedia,
      video: { ...displayVideo, ...patch },
    });
  };

  const haltMediaForNavigation = () => {
    narration.stopImmediate();
    void cleanupVideo();
  };

  const handlePrevious = () => {
    onBeforeStepChange?.();
    setMixOpen(false);
    haltMediaForNavigation();
    onPrevious();
  };

  const handleNext = () => {
    onBeforeStepChange?.();
    setMixOpen(false);
    haltMediaForNavigation();
    onNext();
  };

  const handleExit = () => {
    onBeforeStepChange?.();
    setMixOpen(false);
    haltMediaForNavigation();
    onExit();
  };

  const narrationFault =
    narration.playbackError != null || (mediaError && remoteMediaStatus === 'error');

  const handlePublishedNarrationCenterTap = useCallback(() => {
    const uri = playbackMedia.audio?.uri;
    if (!uri || !narrationActive) return;
    if (narration.isPreparing) return;
    const onFinish = () => onNarrationFinished?.();
    if (narrationFault) {
      narration.clearError();
      if (mediaError) retryRemoteMedia();
      void narration.replay(uri, playbackMedia, onFinish).then((ok) => {
        if (ok) {
          setNarrationNeedsUserStart(false);
          flashNarrationHint('Playing');
        }
      });
      return;
    }
    if (narration.hasEnded) {
      void narration.replay(uri, playbackMedia, onFinish).then((ok) => {
        if (ok) flashNarrationHint('Replay');
      });
      return;
    }
    if (narration.isPlaying) {
      void narration.pausePlayback().then(() => flashNarrationHint('Paused'));
      return;
    }
    void narration.playUri(uri, playbackMedia, onFinish).then((ok) => {
      if (ok) {
        setNarrationNeedsUserStart(false);
        flashNarrationHint('Playing');
        onMediaPlaybackStarted?.();
      } else {
        setNarrationNeedsUserStart(true);
      }
    });
  }, [
    flashNarrationHint,
    mediaError,
    narration,
    narrationActive,
    narrationFault,
    narration.hasEnded,
    narration.isPlaying,
    narration.isPreparing,
    onMediaPlaybackStarted,
    onNarrationFinished,
    playbackMedia,
    remoteMediaStatus,
    retryRemoteMedia,
  ]);

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
        {stepKind === 'photo' && playbackRecord.media.photo?.uri ? (
          <Image
            source={{ uri: playbackRecord.media.photo.uri }}
            onError={() => retryRemoteMedia()}
            style={styles.heroImage}
            contentFit="contain"
          />
        ) : null}
        {stepKind === 'video' && displayVideo?.uri ? (
          <View style={styles.videoStageStandard}>
            <View style={skywriteVideoFrameStyle(videoAspect, 480)}>
              <Video
                ref={videoPlayback.videoRef}
                style={skywriteVideoElementStyle()}
                source={{ uri: displayVideo.uri }}
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

  const narrationDuration =
    narration.durationMs ||
    playbackRecord.media.audio?.durationMs ||
    0;
  const narrationPosition = narrationActive ? narration.positionMs : 0;
  const publishedImmersiveNarration =
    !enablePreviewPlaybackChrome && narrationActive && Boolean(playbackMedia.audio?.uri);
  const showNarrationToolbar =
    enablePreviewPlaybackChrome && narrationActive && Boolean(playbackMedia.audio?.uri);
  const showNarrationTapStart =
    publishedImmersiveNarration &&
    !tapToPlayPrompt &&
    narrationNeedsUserStart &&
    !narrationFault &&
    !narration.isPlaying &&
    !narration.isPreparing;
  const centerNarrationBottomInset = Math.max(insets.bottom, 10) + (bottomSlot ? 200 : 150);
  const skyReelRemainingMs =
    skyReelActiveUntilMs != null ? skyReelActiveUntilMs - Date.now() : null;
  void expiryTick;
  const publishedVideoDurationMs = resolveCombinedTimelineMs(
    videoPlayback.durationMs,
    displayVideo?.durationMs,
    playbackRecord.media.video?.durationMs,
    playbackRecord.media.audio?.durationMs,
  );
  const publishedDurationKnown =
    remoteMediaStatus !== 'loading' &&
    (videoPlayback.isLoaded || publishedVideoDurationMs > 0);

  return (
    <View style={styles.immersiveRoot}>
      {navigationMode === 'edgeTap' && !framingAdjustActive && !tapToPlayPrompt ? (
        <SkywritePlayEdgeNavigation
          canPrevious={canPrevious}
          canNext={canNext}
          onPrevious={handlePrevious}
          onNext={handleNext}
          disabled={tapToPlayPrompt}
          topInset={insets.top + 52}
          bottomInset={Math.max(insets.bottom, 10) + (bottomSlot ? 200 : 150)}
        />
      ) : null}
      <View style={styles.immersiveStage} onLayout={onStageLayout}>
        {stepKind === 'video' && displayVideo?.uri ? (
          <SkywriteFramedVideoLayer
            ref={framingLayerRef}
            video={displayVideo}
            aspectRatio={videoAspect}
            editable={canEditFraming}
            onVideoPatch={patchDisplayVideo}
            onAdjustModeChange={setFramingAdjustActive}
            videoRef={videoPlayback.videoRef}
            isPlaying={videoPlayback.isPlaying}
            onPauseForAdjust={async () => {
              if (videoPlayback.isPlaying) await videoPlayback.togglePlayPause();
            }}
            onResumeAfterAdjust={async (wasPlaying) => {
              if (wasPlaying) await videoPlayback.togglePlayPause();
            }}
            onPlaybackStatusUpdate={videoPlayback.onPlaybackStatusUpdate}
            onLoad={(status) => {
              handleVideoLoad(status);
              if (autoPlayVideo) requestAutoPlay();
            }}
          />
        ) : null}

        {stepKind === 'photo' && playbackRecord.media.photo?.uri ? (
          <>
            <Image
              source={{ uri: playbackRecord.media.photo.uri }}
              onError={() => retryRemoteMedia()}
              style={StyleSheet.absoluteFill}
              contentFit="contain"
              accessibilityIgnoresInvertColors
            />
            {showNarrationToolbar ? (
              <View style={styles.photoNarrationWave}>
                <SkywriteAudioWaveform
                  active={narration.isPlaying}
                  seed={record.id.length + 7}
                  barCount={16}
                />
              </View>
            ) : null}
            {publishedImmersiveNarration && narration.isPlaying ? (
              <View style={styles.photoNarrationWave} pointerEvents="none">
                <SkywriteAudioWaveform
                  active
                  seed={record.id.length + 7}
                  barCount={16}
                />
              </View>
            ) : null}
          </>
        ) : null}

        {stepKind === 'text' ? (
          <View style={styles.textStage}>
            <Text style={[styles.bodyTextImmersive, getSkywriteWriteInputStyle(record.textStyle)]}>
              {record.text.trim() || '…'}
            </Text>
            {showNarrationToolbar ? (
              <View style={styles.inlineWave}>
                <SkywriteAudioWaveform
                  active={narration.isPlaying}
                  seed={record.id.length + 3}
                  barCount={18}
                />
              </View>
            ) : null}
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
          {showSkyReelExpiry && skyReelRemainingMs != null ? (
            <Text
              style={styles.skyReelExpiry}
              accessibilityLabel={`SkyReel visibility ${formatSkyReelRemainingLabel(skyReelRemainingMs)}`}
              pointerEvents="none">
              {formatSkyReelRemainingLabel(skyReelRemainingMs)}
            </Text>
          ) : null}
          <Text style={styles.progressCompact}>
            {SkywritePlayCopy.progress(stepIndex + 1, stepCount)}
          </Text>
        </View>
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
                adjustActive={framingAdjustActive}
                onVideoPatch={patchDisplayVideo}
                onRequestAdjust={() => framingLayerRef.current?.beginAdjust()}
                onRequestDone={() => framingLayerRef.current?.endAdjust()}
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
              {formatSkywritePlaybackDurationLabel(
                enablePreviewPlaybackChrome
                  ? combinedDurationMs || displayVideo?.durationMs
                  : publishedVideoDurationMs,
                enablePreviewPlaybackChrome
                  ? combinedDurationMs > 0 || Boolean(displayVideo?.durationMs)
                  : publishedDurationKnown,
              )}
            </Text>
            {enablePreviewPlaybackChrome && playbackPhase === 'ended' ? (
              <Pressable
                style={styles.toolbarChip}
                onPress={() => void replayVideo()}
                accessibilityLabel="Replay">
                <Text style={styles.toolbarChipText}>Replay</Text>
              </Pressable>
            ) : null}
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
          {enablePreviewPlaybackChrome ? (
            <SkywritePlaybackSeekBar
              positionMs={videoPlayback.positionMs}
              durationMs={resolveCombinedTimelineMs(
                combinedDurationMs,
                videoPlayback.durationMs,
                displayVideo?.durationMs,
                playbackRecord.media.audio?.durationMs,
              )}
              disabled={combinedDurationMs <= 0 && !displayVideo?.durationMs}
              onScrubStart={() => void beginScrub()}
              onScrub={(ms) => void scrubTo(ms)}
              onScrubEnd={(ms) => void endScrub(ms)}
              accessibilityLabel="Video playback position"
            />
          ) : null}
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

        {showNarrationToolbar ? (
          <>
            <View style={styles.videoToolbar}>
              {(() => {
                const showPause =
                  narration.isPlaying && !narrationFault && !narration.isPreparing;
                const chipLabel = narration.isPreparing
                  ? 'Loading narration'
                  : narrationFault
                    ? 'Retry narration'
                    : showPause
                      ? 'Pause narration'
                      : narration.hasEnded
                        ? 'Replay narration'
                        : 'Play narration';
                return (
              <Pressable
                style={styles.playChip}
                disabled={narration.isPreparing}
                onPress={() => {
                  const uri = playbackMedia.audio?.uri;
                  if (!uri) return;
                  if (narrationFault || narration.hasEnded) {
                    narration.clearError();
                    if (mediaError) retryRemoteMedia();
                    void narration.replay(uri, playbackMedia, () => onNarrationFinished?.());
                    return;
                  }
                  void narration.toggleOrPlay(uri, playbackMedia, () => onNarrationFinished?.());
                }}
                accessibilityLabel={chipLabel}>
                <Text style={styles.playIcon}>
                  {narration.isPreparing ? '…' : showPause ? '❚❚' : '▶'}
                </Text>
              </Pressable>
                );
              })()}
              <Text style={styles.timeLabel}>
                {formatSkywriteAudioDuration(narrationPosition)} /{' '}
                {formatSkywriteAudioDuration(narrationDuration)}
              </Text>
              {showAudioMixControls && onMediaMixChange ? (
                <Pressable
                  style={styles.toolbarChip}
                  onPress={() => setMixOpen(true)}
                  accessibilityLabel="Voiceover volume">
                  <Text style={styles.toolbarChipText}>Voiceover</Text>
                </Pressable>
              ) : null}
              {enablePreviewPlaybackChrome && narration.hasEnded ? (
                <Pressable
                  style={styles.toolbarChip}
                  onPress={() => {
                    const uri = playbackMedia.audio?.uri;
                    if (!uri) return;
                    void narration.replay(uri, playbackMedia, () => onNarrationFinished?.());
                  }}
                  accessibilityLabel="Replay narration">
                  <Text style={styles.toolbarChipText}>Replay</Text>
                </Pressable>
              ) : null}
            </View>
            {enablePreviewPlaybackChrome ? (
              <SkywritePlaybackSeekBar
                positionMs={narration.positionMs}
                durationMs={narration.durationMs || playbackMedia.audio?.durationMs || 0}
                disabled={(narration.durationMs || playbackMedia.audio?.durationMs || 0) <= 0}
                onScrubStart={() => void narration.beginScrub()}
                onScrub={(ms) => void narration.seekToMs(ms, false)}
                onScrubEnd={(ms) => void narration.endScrub(ms)}
                accessibilityLabel="Narration playback position"
              />
            ) : null}
          </>
        ) : null}

        {navigationMode === 'buttons' ? (
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
        ) : null}

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

      {publishedImmersiveNarration &&
      !tapToPlayPrompt &&
      !framingAdjustActive &&
      navigationMode === 'edgeTap' ? (
        <Pressable
          style={[
            styles.publishedNarrationCenterTap,
            {
              marginTop: insets.top + 52,
              marginBottom: centerNarrationBottomInset,
            },
          ]}
          accessibilityRole="button"
          accessibilityLabel={
            narrationFault
              ? 'Retry narration'
              : narration.isPlaying
                ? 'Pause narration'
                : narration.hasEnded
                  ? 'Replay narration'
                  : 'Play narration'
          }
          onPress={handlePublishedNarrationCenterTap}
        />
      ) : null}

      {showNarrationTapStart ? (
        <View style={styles.narrationTapStartBanner} pointerEvents="none">
          <Text style={styles.tapBannerText}>Tap center to play voiceover</Text>
        </View>
      ) : null}

      {narrationCenterHint ? (
        <View style={styles.narrationCenterHint} pointerEvents="none">
          <Text style={styles.narrationCenterHintText}>{narrationCenterHint}</Text>
        </View>
      ) : null}

      {publishedImmersiveNarration && narrationFault ? (
        <Pressable
          style={[styles.narrationRetryFab, { bottom: Math.max(insets.bottom, 12) + 72 }]}
          accessibilityRole="button"
          accessibilityLabel="Retry narration"
          onPress={handlePublishedNarrationCenterTap}>
          <Text style={styles.narrationRetryFabText}>Retry</Text>
        </Pressable>
      ) : null}

      {tapToPlayPrompt && onTapToPlayContinue ? (
        <Pressable
          style={styles.tapStartOverlay}
          accessibilityRole="button"
          accessibilityLabel={SkywritePlayCopy.tapToPlaySky}
          onPress={onTapToPlayContinue}>
          <View style={styles.tapBanner}>
            <Text style={styles.tapBannerText}>{SkywritePlayCopy.tapToPlaySky}</Text>
          </View>
        </Pressable>
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
    zIndex: 25,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minHeight: 44,
    zIndex: 4,
  },
  closeBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 5,
  },
  publishedNarrationCenterTap: {
    position: 'absolute',
    left: '28%',
    right: '28%',
    top: 0,
    bottom: 0,
    zIndex: 3,
  },
  narrationTapStartBanner: {
    position: 'absolute',
    left: 24,
    right: 24,
    bottom: '38%',
    zIndex: 4,
    alignItems: 'center',
    pointerEvents: 'none',
  },
  narrationCenterHint: {
    position: 'absolute',
    alignSelf: 'center',
    top: '46%',
    zIndex: 5,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: 'rgba(5, 5, 8, 0.72)',
    pointerEvents: 'none',
  },
  narrationCenterHintText: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF8F0',
  },
  narrationRetryFab: {
    position: 'absolute',
    alignSelf: 'center',
    zIndex: 6,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: 'rgba(20, 16, 28, 0.92)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(232, 200, 114, 0.45)',
  },
  narrationRetryFabText: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    fontWeight: '700',
    color: '#E8C872',
  },
  tapStartOverlay: {
    ...StyleSheet.absoluteFill,
    zIndex: 45,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 72,
    backgroundColor: 'rgba(5, 5, 8, 0.55)',
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
  skyReelExpiry: {
    fontFamily: Fonts.sans,
    fontSize: 10,
    fontWeight: '600',
    color: 'rgba(232, 200, 114, 0.88)',
    marginLeft: 4,
    maxWidth: 88,
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
    zIndex: 3,
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
  inlineWave: { marginTop: 18, paddingHorizontal: 8 },
  photoNarrationWave: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 120,
  },
});
