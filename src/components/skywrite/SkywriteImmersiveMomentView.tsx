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
import { SkywriteFramedPhotoLayer } from '@/components/skywrite/SkywriteFramedPhotoLayer';
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
import { SkywriteStoryProgressBar } from '@/components/skywrite/SkywriteStoryProgressBar';
import { safeStoryFillRatio } from '@/skywrite/play/skywriteStoryProgress';
import { useSkywriteImmersiveVideoPlayback } from '@/skywrite/media/useSkywriteImmersiveVideoPlayback';
import { useSkywriteNarrationPlayback } from '@/skywrite/media/useSkywriteNarrationPlayback';
import type { SkywritePlayStepKind } from '@/skywrite/play/skywritePlayTypes';
import { useResolvedSkywriteRecord } from '@/social/useResolvedSkywriteRecord';
import type { SkywriteMedia, SkywriteRecord } from '@/skywrite/types';
import { SkyReelStoryHeader } from '@/components/skywrite/SkyReelStoryHeader';
import { SkyReelAudioStoryStage } from '@/components/skywrite/SkyReelAudioStoryStage';
import {
  getSkywriteAudioSource,
  getSkywritePlayableAudioUri,
  logSkyReelAudioInDev,
  skywriteAudioNeedsRemoteResolve,
} from '@/skywrite/media/getSkywriteAudioSource';
import { resolveSkyReelStoryStillDwellMs } from '@/skywrite/play/skyReelStoryTiming';
import { stepUsesAttachedVoiceover } from '@/skywrite/voiceoverStepUtils';

interface SkywriteImmersiveMomentViewProps {
  record: SkywriteRecord;
  stepKind: SkywritePlayStepKind;
  stepIndex: number;
  stepCount: number;
  /** One progress segment per Skywrite post (defaults to step index/count). */
  storySegmentIndex?: number;
  storySegmentCount?: number;
  storyAuthorName?: string;
  storyAuthorAvatarUri?: string | null;
  storyAgeLabel?: string | null;
  onStoryProfilePress?: () => void;
  onStoryMenuPress?: () => void;
  skyReelViewerCount?: number;
  onOpenSkyReelViewers?: () => void;
  showSkyReelViewerAffordance?: boolean;
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
  showSkyReelExpiry?: boolean;
  onStoryHoldPauseStart?: () => void;
  onStoryHoldPauseEnd?: () => void;
  onMediaPlaybackStarted?: () => void;
  /** Compose preview: stop video + narration when Back to editing bypasses handleExit. */
  onRegisterMediaStop?: (stop: () => void) => void;
  /** Compose preview: seek bar + replay without changing SkyReel chrome. */
  enablePreviewPlaybackChrome?: boolean;
  /** Standalone audio step progress (overlay preview engine). */
  overlayAudioProgress?: { positionMs: number; durationMs: number; isPlaying: boolean };
  /** Persistent post viewer vs SkyReel story playback. */
  viewerMode?: 'post' | 'skyreel';
}

function SkywriteImmersiveMomentViewComponent({
  record,
  stepKind,
  stepIndex,
  stepCount,
  storySegmentIndex,
  storySegmentCount,
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
  storyAuthorName,
  storyAuthorAvatarUri,
  storyAgeLabel,
  onStoryProfilePress,
  onStoryMenuPress,
  skyReelViewerCount,
  onOpenSkyReelViewers,
  showSkyReelViewerAffordance = false,
  onStoryHoldPauseStart,
  onStoryHoldPauseEnd,
  onMediaPlaybackStarted,
  onRegisterMediaStop,
  enablePreviewPlaybackChrome = false,
  overlayAudioProgress,
  viewerMode = 'skyreel',
}: SkywriteImmersiveMomentViewProps) {
  const insets = useSafeAreaInsets();
  const segmentIndex = storySegmentIndex ?? stepIndex;
  const segmentCount = storySegmentCount ?? stepCount;
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
  const isPublishedPlayerLayout = layoutMode === 'viewport' && !enablePreviewPlaybackChrome;
  const playableAudioUri = getSkywritePlayableAudioUri(playbackRecord);
  const standalonePublishedAudio =
    isPublishedPlayerLayout && stepKind === 'audio' && Boolean(playableAudioUri);
  const narrationPlaybackActive = narrationActive || standalonePublishedAudio;
  const narration = useSkywriteNarrationPlayback(narrationPlaybackActive, playSessionId);
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
    if (prev === 'loading' && remoteMediaStatus === 'ready' && narrationPlaybackActive) {
      narrationStartedRef.current = false;
    }
  }, [
    autoPlayVideo,
    narrationPlaybackActive,
    remoteMediaStatus,
    requestAutoPlay,
    sequencePaused,
    stepKind,
  ]);

  useEffect(() => {
    if (!standalonePublishedAudio || !__DEV__) return;
    logSkyReelAudioInDev(playbackRecord, 'skyreel-audio-step', {
      remoteMediaStatus,
      playbackPhase: narration.playbackPhase,
      durationMs: narration.durationMs,
      positionMs: narration.positionMs,
      playbackError: narration.playbackError,
      isPlaying: narration.isPlaying,
    });
  }, [
    narration.durationMs,
    narration.isPlaying,
    narration.playbackError,
    narration.playbackPhase,
    narration.positionMs,
    playbackRecord,
    remoteMediaStatus,
    standalonePublishedAudio,
  ]);

  useEffect(() => {
    if (!narrationPlaybackActive || !narrationAutoplay || narrationPaused || narrationStartedRef.current) {
      return;
    }
    if (skywriteAudioNeedsRemoteResolve(playbackRecord) && remoteMediaStatus === 'loading') {
      return;
    }
    const uri = getSkywritePlayableAudioUri(playbackRecord);
    if (!uri) {
      if (standalonePublishedAudio && __DEV__) {
        logSkyReelAudioInDev(playbackRecord, 'skyreel-audio-missing-playable-uri');
      }
      return;
    }
    narrationStartedRef.current = true;
    narrationSessionRef.current = playSessionIdRef.current;
    void narration
      .playUri(uri, playbackMedia, () => {
        if (narrationSessionRef.current !== playSessionIdRef.current) return;
        onNarrationFinished?.();
      })
      .then((result) => {
        if (result !== 'ok') {
          narrationStartedRef.current = false;
        }
        if (result === 'ok') {
          setNarrationNeedsUserStart(false);
          onMediaPlaybackStarted?.();
        } else if (result === 'play_failed') {
          setNarrationNeedsUserStart(true);
          onVideoAutoplayBlocked?.();
        } else if (result === 'load_failed') {
          setNarrationNeedsUserStart(true);
        } else {
          setNarrationNeedsUserStart(false);
        }
      });
  }, [
    narration,
    narrationAutoplay,
    narrationPaused,
    narrationPlaybackActive,
    mediaStartNonce,
    onMediaPlaybackStarted,
    onNarrationFinished,
    onVideoAutoplayBlocked,
    playSessionId,
    playbackMedia,
    playbackRecord,
    remoteMediaStatus,
    standalonePublishedAudio,
  ]);

  useEffect(() => {
    if (!narrationPlaybackActive) return;
    if (narrationPaused) {
      if (narration.isPlaying) void narration.pausePlayback();
      return;
    }
    if (
      narrationStartedRef.current &&
      !narrationNeedsUserStart &&
      !narration.hasEnded &&
      narration.playbackPhase === 'paused' &&
      narration.positionMs > 0
    ) {
      void narration.resumePlayback();
    }
  }, [
    narration,
    narrationNeedsUserStart,
    narrationPaused,
    narrationPlaybackActive,
    narration.hasEnded,
    narration.isPlaying,
    narration.playbackPhase,
    narration.positionMs,
  ]);

  useEffect(() => {
    if (!narrationPlaybackActive) return;
    void narration.setVolumeFromMedia(playbackMedia);
  }, [narration, narrationPlaybackActive, playbackMedia, playbackMedia.voiceoverVolume]);

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

  const audioUri = playableAudioUri ?? getSkywriteAudioSource(playbackRecord).uri;
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

  const isPublishedPlayer = layoutMode === 'viewport' && !enablePreviewPlaybackChrome;
  const isPostViewer = viewerMode === 'post';
  const showStoryProgress =
    !isPostViewer && layoutMode === 'viewport' && navigationMode === 'edgeTap';
  const postMediaReady = remoteMediaStatus !== 'loading';
  const [postLoadBarVisible, setPostLoadBarVisible] = useState(true);

  useEffect(() => {
    if (!isPostViewer) return;
    if (!postMediaReady) {
      setPostLoadBarVisible(true);
      return;
    }
    const hideTimer = setTimeout(() => setPostLoadBarVisible(false), 420);
    return () => clearTimeout(hideTimer);
  }, [isPostViewer, postMediaReady, record.id, stepIndex]);

  const postLoadFill = useMemo(() => {
    if (!isPostViewer) return 0;
    if (!postMediaReady) return 0;
    return 1;
  }, [isPostViewer, postMediaReady]);
  const stillDwellTotalMs = useMemo(() => {
    if (stepKind === 'text') {
      return resolveSkyReelStoryStillDwellMs('text', record.text);
    }
    if (stepKind === 'photo') {
      return resolveSkyReelStoryStillDwellMs('photo');
    }
    return resolveSkyReelStoryStillDwellMs('photo');
  }, [record.text, stepKind]);
  const [stillDwellElapsedMs, setStillDwellElapsedMs] = useState(0);

  useEffect(() => {
    if (!isPublishedPlayer || isPostViewer) return;
    if (narrationActive || stepKind === 'video' || stepKind === 'audio') return;
    if (stepKind !== 'text' && stepKind !== 'photo') return;
    if (sequencePaused || tapToPlayPrompt || narrationPaused) {
      return;
    }
    setStillDwellElapsedMs(0);
    const started = Date.now();
    const timer = setInterval(() => setStillDwellElapsedMs(Date.now() - started), 200);
    return () => clearInterval(timer);
  }, [
    isPostViewer,
    isPublishedPlayer,
    mediaStartNonce,
    narrationActive,
    narrationPaused,
    playSessionId,
    sequencePaused,
    stepKind,
    stepIndex,
    tapToPlayPrompt,
  ]);

  const narrationFault =
    narration.playbackPhase === 'error' || (mediaError && remoteMediaStatus === 'error');

  const handlePublishedNarrationCenterTap = useCallback(() => {
    const uri = getSkywritePlayableAudioUri(playbackRecord);
    if (!uri || !narrationPlaybackActive) return;
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
    void narration.playUri(uri, playbackMedia, onFinish).then((result) => {
      if (result === 'ok') {
        setNarrationNeedsUserStart(false);
        flashNarrationHint('Playing');
        onMediaPlaybackStarted?.();
      } else if (result === 'play_failed') {
        setNarrationNeedsUserStart(true);
      }
    });
  }, [
    flashNarrationHint,
    mediaError,
    narration,
    narrationPlaybackActive,
    narrationFault,
    narration.hasEnded,
    narration.isPlaying,
    narration.isPreparing,
    onMediaPlaybackStarted,
    onNarrationFinished,
    playbackMedia,
    playbackRecord,
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

  const narrationDuration =
    narration.durationMs ||
    playbackRecord.media.audio?.durationMs ||
    0;
  const narrationPosition = narrationActive ? narration.positionMs : 0;
  const publishedImmersiveNarration =
    !enablePreviewPlaybackChrome &&
    narrationPlaybackActive &&
    Boolean(getSkywritePlayableAudioUri(playbackRecord));
  const showNarrationToolbar =
    enablePreviewPlaybackChrome && narrationActive && Boolean(playbackMedia.audio?.uri);
  const showNarrationTapStart =
    standalonePublishedAudio &&
    publishedImmersiveNarration &&
    !tapToPlayPrompt &&
    (narrationNeedsUserStart || narration.playbackError === 'play_failed') &&
    !narrationFault &&
    !narration.isPlaying &&
    !narration.isPreparing;
  const centerNarrationBottomInset = Math.max(insets.bottom, 10) + (bottomSlot ? 200 : 150);
  void expiryTick;
  void skyReelActiveUntilMs;
  const publishedVideoDurationMs = resolveCombinedTimelineMs(
    videoPlayback.durationMs,
    displayVideo?.durationMs,
    playbackRecord.media.video?.durationMs,
    playbackRecord.media.audio?.durationMs,
  );
  const publishedDurationKnown =
    remoteMediaStatus !== 'loading' &&
    (videoPlayback.isLoaded || publishedVideoDurationMs > 0);

  const storyProgressPaused =
    sequencePaused ||
    tapToPlayPrompt ||
    narrationPaused ||
    (stepKind === 'video' &&
      (playbackPhase === 'paused' || playbackPhase === 'loading' || remoteMediaStatus === 'loading')) ||
    (narrationPlaybackActive &&
      (narration.playbackPhase === 'paused' ||
        narration.playbackPhase === 'loading' ||
        remoteMediaStatus === 'loading'));

  const currentStorySegmentFill = useMemo(() => {
    if (storyProgressPaused && narrationPlaybackActive && narration.playbackPhase === 'paused') {
      return safeStoryFillRatio(narration.positionMs, narration.durationMs || playbackMedia.audio?.durationMs);
    }
    if (storyProgressPaused && stepKind === 'video' && playbackPhase === 'paused') {
      const dur = resolveCombinedTimelineMs(
        combinedDurationMs,
        videoPlayback.durationMs,
        displayVideo?.durationMs,
        playbackRecord.media.audio?.durationMs,
      );
      return safeStoryFillRatio(videoPlayback.positionMs, dur);
    }
    if (stepKind === 'video') {
      if (remoteMediaStatus === 'loading' || playbackPhase === 'loading') return 0;
      if (playbackPhase === 'ended') return 1;
      if (playbackPhase === 'error') return 0;
      const dur = resolveCombinedTimelineMs(
        combinedDurationMs,
        videoPlayback.durationMs,
        displayVideo?.durationMs,
        playbackRecord.media.audio?.durationMs,
      );
      return safeStoryFillRatio(videoPlayback.positionMs, dur);
    }
    if (narrationPlaybackActive || stepKind === 'audio') {
      if (remoteMediaStatus === 'loading' || narration.playbackPhase === 'loading') return 0;
      if (narration.playbackPhase === 'ended') return 1;
      if (narration.playbackPhase === 'error') return 0;
      const dur = narration.durationMs || playbackMedia.audio?.durationMs || 0;
      return safeStoryFillRatio(narration.positionMs, dur);
    }
    if (stepKind === 'text' || stepKind === 'photo') {
      return safeStoryFillRatio(stillDwellElapsedMs, stillDwellTotalMs);
    }
    return 0;
  }, [
    combinedDurationMs,
    displayVideo?.durationMs,
    narration.durationMs,
    narration.playbackPhase,
    narration.positionMs,
    narrationActive,
    overlayAudioProgress?.durationMs,
    overlayAudioProgress?.positionMs,
    playbackMedia.audio?.durationMs,
    playbackPhase,
    playbackRecord.media.audio?.durationMs,
    record.media.audio?.durationMs,
    remoteMediaStatus,
    stepKind,
    stillDwellElapsedMs,
    stillDwellTotalMs,
    storyProgressPaused,
    videoPlayback.durationMs,
    videoPlayback.positionMs,
  ]);

  const handlePublishedCenterTap = useCallback(() => {
    if (stepKind === 'video') {
      void (async () => {
        await videoPlayback.togglePlayPause();
        flashNarrationHint(
          videoPlayback.playbackPhase === 'playing' ? 'Playing' : 'Paused',
        );
      })();
      return;
    }
    if (stepKind === 'audio' && standalonePublishedAudio) {
      handlePublishedNarrationCenterTap();
      return;
    }
    if (stepKind === 'audio' && audioUri) {
      onToggleAudio(previewId, audioUri);
      flashNarrationHint(audioPlaying ? 'Paused' : 'Playing');
      return;
    }
    handlePublishedNarrationCenterTap();
  }, [
    audioPlaying,
    audioUri,
    flashNarrationHint,
    handlePublishedNarrationCenterTap,
    onToggleAudio,
    previewId,
    standalonePublishedAudio,
    stepKind,
    videoPlayback,
  ]);

  const publishedCenterTapActive =
    isPublishedPlayer &&
    !tapToPlayPrompt &&
    !framingAdjustActive &&
    navigationMode === 'edgeTap' &&
    (publishedImmersiveNarration || stepKind === 'video' || stepKind === 'audio');

  if (layoutMode !== 'viewport') {
    return renderStandardLayout();
  }

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
          onHoldStart={onStoryHoldPauseStart}
          onHoldEnd={onStoryHoldPauseEnd}
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
            <SkywriteFramedPhotoLayer
              photo={playbackRecord.media.photo}
              showFitBackdrop={isPublishedPlayer}
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
          </>
        ) : null}

        {stepKind === 'text' ? (
          <>
            {isPublishedPlayer ? (
              <>
                <LinearGradient
                  colors={['#050814', '#0A1228', '#121A38', '#0E1630']}
                  locations={[0, 0.4, 0.75, 1]}
                  style={StyleSheet.absoluteFill}
                />
                {[18, 42, 67, 83].map((left) => (
                  <View
                    key={`text-star-${left}`}
                    style={[
                      styles.textStoryStar,
                      { left: `${left}%`, top: `${(left * 5) % 70 + 8}%` },
                    ]}
                  />
                ))}
              </>
            ) : null}
            <View style={[styles.textStage, isPublishedPlayer && styles.textStagePublished]}>
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
          </>
        ) : null}

        {stepKind === 'audio' && isPublishedPlayer ? (
          <SkyReelAudioStoryStage
            skywriteId={record.id}
            playSessionId={playSessionId}
            captionText={record.text}
            isPlaying={narration.isPlaying}
            isLoading={
              remoteMediaStatus === 'loading' ||
              narration.isPreparing ||
              (narration.durationMs <= 0 && !narrationFault)
            }
            hasError={narrationFault || (!playableAudioUri && remoteMediaStatus === 'ready')}
            positionMs={narration.positionMs}
            durationMs={
              narration.durationMs ||
              playbackRecord.media.audio?.durationMs ||
              0
            }
          />
        ) : null}

        {stepKind === 'audio' && audioUri && !isPublishedPlayer ? (
          <View style={styles.audioStage}>
            <SkywriteAudioWaveform active={audioPlaying} seed={record.id.length} barCount={22} />
          </View>
        ) : null}
      </View>

      <LinearGradient
        colors={['rgba(5, 5, 8, 0.82)', 'rgba(5, 5, 8, 0.35)', 'transparent']}
        style={[styles.topGradient, { paddingTop: insets.top + 4 }]}
        pointerEvents="box-none">
        {showStoryProgress ? (
          <SkywriteStoryProgressBar
            stepIndex={segmentIndex}
            stepCount={segmentCount}
            currentSegmentFill={currentStorySegmentFill}
            style={styles.storyProgressRow}
          />
        ) : null}
        {isPostViewer && postLoadBarVisible ? (
          <SkywriteStoryProgressBar
            stepIndex={0}
            stepCount={1}
            currentSegmentFill={postLoadFill}
            style={styles.storyProgressRow}
            accessibilityLabel="Loading post"
          />
        ) : null}
        {isPublishedPlayer && storyAuthorName ? (
          <SkyReelStoryHeader
            displayName={storyAuthorName}
            avatarUri={storyAuthorAvatarUri}
            ageLabel={storyAgeLabel ?? null}
            onProfilePress={onStoryProfilePress}
            onMenuPress={onStoryMenuPress}
            onClose={handleExit}
          />
        ) : (
          <View style={styles.topRow}>
            <Pressable
              onPress={handleExit}
              hitSlop={12}
              accessibilityLabel={SkywritePlayCopy.exitPlay}
              style={styles.closeBtn}>
              <Text style={styles.closeIcon}>✕</Text>
            </Pressable>
            {!isPostViewer ? (
              <Text style={styles.progressCompact}>
                {SkywritePlayCopy.progress(segmentIndex + 1, segmentCount)}
              </Text>
            ) : null}
          </View>
        )}
      </LinearGradient>

      <LinearGradient
        colors={['transparent', 'rgba(5, 5, 8, 0.55)', 'rgba(5, 5, 8, 0.92)']}
        style={[styles.bottomGradient, { paddingBottom: Math.max(insets.bottom, 10) }]}
        pointerEvents="box-none">
        {showSkyReelViewerAffordance && onOpenSkyReelViewers ? (
          <Pressable
            style={styles.viewerChip}
            onPress={onOpenSkyReelViewers}
            accessibilityRole="button"
            accessibilityLabel="SkyReel viewers">
            <Text style={styles.viewerChipText}>
              👁 {typeof skyReelViewerCount === 'number' ? skyReelViewerCount : 0} viewers
            </Text>
          </Pressable>
        ) : null}
        {record.text.trim() && stepKind !== 'text' && stepKind !== 'audio' ? (
          <Text style={styles.captionOverlay} numberOfLines={3}>
            {record.text.trim()}
          </Text>
        ) : null}

        {stepKind === 'video' && displayVideo?.uri && enablePreviewPlaybackChrome ? (
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

        {stepKind === 'audio' && audioUri && enablePreviewPlaybackChrome ? (
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
                const showPause = narration.playbackPhase === 'playing';
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

      {publishedCenterTapActive ? (
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
            stepKind === 'video'
              ? videoPlayback.isPlaying
                ? 'Pause video'
                : 'Play video'
              : stepKind === 'audio'
                ? audioPlaying
                  ? 'Pause audio'
                  : 'Play audio'
                : narrationFault
                  ? 'Retry narration'
                  : narration.playbackPhase === 'playing'
                    ? 'Pause narration'
                    : narration.playbackPhase === 'ended'
                      ? 'Replay narration'
                      : 'Play narration'
          }
          onPress={handlePublishedCenterTap}
        />
      ) : null}

      {showNarrationTapStart ? (
        <Pressable
          style={styles.narrationTapStartBanner}
          accessibilityRole="button"
          accessibilityLabel="Tap to start sound"
          onPress={handlePublishedCenterTap}>
          <Text style={styles.tapBannerText}>Tap center to start sound</Text>
        </Pressable>
      ) : null}

      {narrationCenterHint ? (
        <View style={styles.narrationCenterHint} pointerEvents="none">
          <Text style={styles.narrationCenterHintText}>{narrationCenterHint}</Text>
        </View>
      ) : null}

      {isPublishedPlayer &&
      ((publishedImmersiveNarration && narrationFault) ||
        (stepKind === 'video' && playbackPhase === 'error')) ? (
        <Pressable
          style={[styles.narrationRetryFab, { bottom: Math.max(insets.bottom, 12) + 72 }]}
          accessibilityRole="button"
          accessibilityLabel="Retry playback"
          onPress={handlePublishedCenterTap}>
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
  photoBackdrop: {
    transform: [{ scale: 1.08 }],
    opacity: 0.92,
  },
  photoBackdropDim: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(5, 8, 20, 0.35)',
  },
  textStage: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    width: '100%',
  },
  textStagePublished: {
    maxWidth: 420,
    alignSelf: 'center',
    paddingHorizontal: 28,
  },
  textStoryStar: {
    position: 'absolute',
    width: 2,
    height: 2,
    borderRadius: 1,
    backgroundColor: 'rgba(232, 200, 114, 0.45)',
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
  storyProgressRow: {
    marginTop: 8,
    marginHorizontal: 4,
    height: 4,
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
  viewerChip: {
    alignSelf: 'flex-start',
    marginBottom: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(8, 10, 24, 0.55)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.22)',
  },
  viewerChipText: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    fontWeight: '600',
    color: '#FFF8F0',
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
  expiredOverlay: {
    ...StyleSheet.absoluteFill,
    zIndex: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 28,
    backgroundColor: 'rgba(5, 5, 8, 0.72)',
  },
  expiredCard: {
    maxWidth: 340,
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderRadius: 16,
    backgroundColor: 'rgba(12, 14, 32, 0.92)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(232, 200, 114, 0.35)',
  },
  expiredTitle: {
    fontFamily: Fonts.sans,
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF8F0',
    textAlign: 'center',
    marginBottom: 8,
  },
  expiredHint: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    lineHeight: 19,
    color: 'rgba(248, 244, 236, 0.78)',
    textAlign: 'center',
  },
  expiredSkipBtn: {
    marginTop: 16,
    alignSelf: 'center',
    minHeight: 44,
    paddingHorizontal: 18,
    justifyContent: 'center',
    borderRadius: 999,
    backgroundColor: 'rgba(232, 200, 114, 0.18)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(232, 200, 114, 0.45)',
  },
  expiredSkipText: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    fontWeight: '700',
    color: '#E8C872',
  },
});
