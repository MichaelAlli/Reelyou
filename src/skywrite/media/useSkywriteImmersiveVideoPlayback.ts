import { Audio, Video, type AVPlaybackStatus, type AVPlaybackStatusSuccess } from 'expo-av';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Platform } from 'react-native';

import {
  createSkywriteAudioPlayback,
  type SkywriteAudioPlaybackEngine,
} from '@/skywrite/media/skywriteAudioPlayback';
import { resolveOriginalVideoVolume } from '@/skywrite/media/skywriteOriginalVideoVolume';
import { resolveVoiceoverVolume } from '@/skywrite/media/skywriteVoiceoverVolume';
import type { SkywriteMedia, SkywriteRecord } from '@/skywrite/types';

const VOICE_SYNC_MIN_DRIFT_MS = 280;

function videoVolumeForMedia(media: SkywriteMedia | undefined): number {
  if (!media) return 1;
  return resolveOriginalVideoVolume(media);
}

function voiceoverVolumeForMedia(media: SkywriteMedia | undefined): number {
  if (!media) return 1;
  return resolveVoiceoverVolume(media);
}

export type SkywriteVideoPlaybackPhase =
  | 'idle'
  | 'loading'
  | 'playing'
  | 'paused'
  | 'ended'
  | 'error';

export interface SkywriteImmersiveVideoPlayback {
  videoRef: React.RefObject<Video | null>;
  isPlaying: boolean;
  isLoaded: boolean;
  playbackPhase: SkywriteVideoPlaybackPhase;
  positionMs: number;
  durationMs: number;
  combinedDurationMs: number;
  togglePlayPause: () => Promise<void>;
  seekTo: (ms: number) => Promise<void>;
  beginScrub: () => Promise<void>;
  scrubTo: (ms: number) => Promise<void>;
  endScrub: (ms: number) => Promise<void>;
  replay: () => Promise<void>;
  toggleMute: () => void;
  muted: boolean;
  cleanup: () => Promise<void>;
  onPlaybackStatusUpdate: (status: AVPlaybackStatus) => void;
  applyVideoVolume: () => Promise<void>;
  applyVoiceoverVolume: () => Promise<void>;
  requestAutoPlay: () => void;
  handleVideoLoad: (status: AVPlaybackStatus) => void;
  reportNaturalSize: (width: number, height: number) => void;
  naturalSize: { width: number; height: number } | null;
}

export type SkywriteAutoplayResult = 'started' | 'pending' | 'blocked' | 'error';

export function useSkywriteImmersiveVideoPlayback(
  record: SkywriteRecord | undefined,
  active: boolean,
  mediaOverride?: SkywriteMedia,
  options?: {
    onAutoplayBlocked?: () => void;
    onCombinedPlaybackFinished?: () => void;
    onPlaybackStarted?: () => void;
  },
): SkywriteImmersiveVideoPlayback {
  const optionsRef = useRef(options);
  optionsRef.current = options;

  const videoRef = useRef<Video>(null);
  const voiceoverEngineRef = useRef<SkywriteAudioPlaybackEngine | null>(null);
  const voiceoverUriRef = useRef<string | null>(null);
  const pendingPlayRef = useRef(false);
  const preMuteOriginalRef = useRef(1);
  const videoEndedVoiceContinuesRef = useRef(false);
  const syncInFlightRef = useRef(false);
  const lastVoiceSyncPosRef = useRef(-1);
  const cleanupGenerationRef = useRef(0);
  const voiceExtendedFinishRef = useRef(false);
  const endedLatchRef = useRef(false);
  const scrubbingRef = useRef(false);
  const wasPlayingBeforeScrubRef = useRef(false);
  const lastUiUpdateMsRef = useRef(0);
  const positionMsRef = useRef(0);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [playbackPhase, setPlaybackPhase] = useState<SkywriteVideoPlaybackPhase>('idle');
  const [positionMs, setPositionMs] = useState(0);
  positionMsRef.current = positionMs;
  const [durationMs, setDurationMs] = useState(record?.media.video?.durationMs ?? 0);
  const [muted, setMuted] = useState(false);
  const [naturalSize, setNaturalSize] = useState<{ width: number; height: number } | null>(null);

  const videoUri = mediaOverride?.video?.uri ?? record?.media.video?.uri;
  const audioUri = mediaOverride?.audio?.uri ?? record?.media.audio?.uri;
  const audioDurationMs = mediaOverride?.audio?.durationMs ?? record?.media.audio?.durationMs;
  const combinedDurationMs = Math.max(durationMs, audioDurationMs ?? 0, 0);

  const hasVoiceover =
    Boolean(audioUri) &&
    (record?.mediaMode === 'video_voiceover' ||
      (Boolean(videoUri) && Boolean(audioUri)));

  const originalVolume = videoVolumeForMedia(mediaOverride ?? record?.media);
  const voiceoverVolume = voiceoverVolumeForMedia(mediaOverride ?? record?.media);

  const stopVoiceoverEngine = useCallback(async () => {
    const engine = voiceoverEngineRef.current;
    voiceoverEngineRef.current = null;
    voiceoverUriRef.current = null;
    lastVoiceSyncPosRef.current = -1;
    if (!engine) return;
    try {
      await engine.stop();
    } catch {
      /* unloaded */
    }
  }, []);

  const cleanup = useCallback(async () => {
    const generation = ++cleanupGenerationRef.current;
    pendingPlayRef.current = false;
    videoEndedVoiceContinuesRef.current = false;
    voiceExtendedFinishRef.current = false;
    endedLatchRef.current = false;
    scrubbingRef.current = false;
    setIsPlaying(false);
    setIsLoaded(false);
    setPlaybackPhase('idle');
    setPositionMs(0);
    void stopVoiceoverEngine();
    try {
      const video = videoRef.current;
      if (video) {
        await Promise.race([
          (async () => {
            await video.stopAsync().catch(() => undefined);
            await video.unloadAsync().catch(() => undefined);
          })(),
          new Promise<void>((resolve) => setTimeout(resolve, 400)),
        ]);
      }
    } catch {
      /* unloaded */
    }
    if (generation !== cleanupGenerationRef.current) return;
  }, [stopVoiceoverEngine]);

  useEffect(() => {
    if (!active) {
      void cleanup();
    }
  }, [active, cleanup, record?.id]);

  useEffect(() => {
    return () => {
      void cleanup();
    };
  }, [cleanup, record?.id]);

  useEffect(() => {
    if (Platform.OS === 'web') {
      void Audio.setAudioModeAsync({ playsInSilentModeIOS: true, allowsRecordingIOS: false });
    }
  }, []);

  const markEnded = useCallback(() => {
    if (endedLatchRef.current) return;
    endedLatchRef.current = true;
    videoEndedVoiceContinuesRef.current = false;
    setIsPlaying(false);
    setPlaybackPhase('ended');
    optionsRef.current?.onCombinedPlaybackFinished?.();
  }, []);

  const finishCombinedPlayback = useCallback(() => {
    voiceExtendedFinishRef.current = true;
    markEnded();
  }, [markEnded]);

  const ensureVoiceoverEngine = useCallback(async (): Promise<SkywriteAudioPlaybackEngine | null> => {
    const uri = audioUri;
    if (!hasVoiceover || !uri) return null;
    if (voiceoverEngineRef.current && voiceoverUriRef.current === uri) {
      return voiceoverEngineRef.current;
    }
    await stopVoiceoverEngine();
    const engine = await createSkywriteAudioPlayback(uri, voiceoverVolume, {
      onPosition: (pos) => {
        if (videoEndedVoiceContinuesRef.current) {
          setPositionMs(pos);
        }
      },
      onFinish: () => {
        if (videoEndedVoiceContinuesRef.current) {
          finishCombinedPlayback();
        }
      },
    });
    if (!engine) return null;
    voiceoverEngineRef.current = engine;
    voiceoverUriRef.current = uri;
    return engine;
  }, [audioUri, finishCombinedPlayback, hasVoiceover, stopVoiceoverEngine, voiceoverVolume]);

  const syncVoiceover = useCallback(
    async (position: number, shouldPlay: boolean, force = false) => {
      if (!hasVoiceover || !audioUri) return;
      if (syncInFlightRef.current) return;
      if (
        !force &&
        !videoEndedVoiceContinuesRef.current &&
        lastVoiceSyncPosRef.current >= 0 &&
        Math.abs(lastVoiceSyncPosRef.current - position) < VOICE_SYNC_MIN_DRIFT_MS &&
        shouldPlay
      ) {
        return;
      }
      syncInFlightRef.current = true;
      const generation = cleanupGenerationRef.current;
      try {
        const engine = await ensureVoiceoverEngine();
        if (!engine || generation !== cleanupGenerationRef.current) return;
        await engine.setVolume(voiceoverVolume);
        const voiceDuration = audioDurationMs;
        if (voiceDuration != null && position >= voiceDuration) {
          await engine.pause();
          lastVoiceSyncPosRef.current = position;
          return;
        }
        await engine.seekToMs(position);
        lastVoiceSyncPosRef.current = position;
        if (shouldPlay) {
          await engine.play();
        } else {
          await engine.pause();
        }
      } finally {
        syncInFlightRef.current = false;
      }
    },
    [audioDurationMs, audioUri, ensureVoiceoverEngine, hasVoiceover, voiceoverVolume],
  );

  const applyVoiceoverVolume = useCallback(async () => {
    const engine = voiceoverEngineRef.current;
    if (!engine) return;
    try {
      await engine.setVolume(voiceoverVolume);
    } catch {
      /* not loaded */
    }
  }, [voiceoverVolume]);

  const applyVideoVolume = useCallback(async () => {
    const video = videoRef.current;
    if (!video) return;
    try {
      const status = await video.getStatusAsync();
      if (!status.isLoaded) return;
      const vol = muted ? 0 : originalVolume;
      await video.setVolumeAsync(vol);
    } catch {
      /* not loaded yet */
    }
  }, [muted, originalVolume]);

  const startPlayback = useCallback(async (): Promise<SkywriteAutoplayResult> => {
    const video = videoRef.current;
    if (!video || !videoUri) return 'error';
    const generation = cleanupGenerationRef.current;

    try {
      setPlaybackPhase('loading');
      endedLatchRef.current = false;
      let status = await video.getStatusAsync();
      if (!status.isLoaded) {
        pendingPlayRef.current = true;
        await video.loadAsync(
          { uri: videoUri },
          { shouldPlay: false, progressUpdateIntervalMillis: 250 },
        );
        status = await video.getStatusAsync();
      }

      if (!status.isLoaded || generation !== cleanupGenerationRef.current) return 'error';

      const loaded = status as AVPlaybackStatusSuccess;
      const vol = muted ? 0 : originalVolume;
      await video.setVolumeAsync(vol);
      await video.playAsync();
      await syncVoiceover(loaded.positionMillis ?? 0, true, true);
      setIsPlaying(true);
      setPlaybackPhase('playing');
      pendingPlayRef.current = false;
      optionsRef.current?.onPlaybackStarted?.();
      return 'started';
    } catch {
      pendingPlayRef.current = false;
      setIsPlaying(false);
      setPlaybackPhase('error');
      optionsRef.current?.onAutoplayBlocked?.();
      return 'blocked';
    }
  }, [muted, originalVolume, syncVoiceover, videoUri]);

  const onPlaybackStatusUpdate = useCallback(
    (status: AVPlaybackStatus) => {
      if (!status.isLoaded) return;
      setIsLoaded(true);
      if (scrubbingRef.current) {
        setPositionMs(status.positionMillis);
        return;
      }
      if (endedLatchRef.current) return;

      const now = Date.now();
      const pos = status.positionMillis ?? 0;
      if (!status.isPlaying && !videoEndedVoiceContinuesRef.current) {
        if (now - lastUiUpdateMsRef.current < 750 && Math.abs(pos - positionMsRef.current) < 120) {
          return;
        }
      }
      lastUiUpdateMsRef.current = now;

      if (!videoEndedVoiceContinuesRef.current) {
        setIsPlaying(status.isPlaying);
        setPositionMs(pos);
        if (status.isPlaying) {
          setPlaybackPhase('playing');
        } else if (!endedLatchRef.current) {
          setPlaybackPhase('paused');
        }
      }
      if (status.durationMillis != null) {
        setDurationMs(status.durationMillis);
      }
      if (status.didJustFinish && !endedLatchRef.current) {
        const voiceDur = audioDurationMs ?? 0;
        const endMs = status.durationMillis ?? status.positionMillis ?? 0;
        if (hasVoiceover && voiceDur > endMs + 80) {
          videoEndedVoiceContinuesRef.current = true;
          voiceExtendedFinishRef.current = false;
          void (async () => {
            try {
              await videoRef.current?.pauseAsync();
            } catch {
              /* paused */
            }
            await syncVoiceover(endMs, true, true);
            setIsPlaying(true);
            setPlaybackPhase('playing');
          })();
          return;
        }
        void stopVoiceoverEngine();
        markEnded();
      }
    },
    [audioDurationMs, hasVoiceover, markEnded, stopVoiceoverEngine, syncVoiceover],
  );

  const handleVideoLoad = useCallback(
    (status: AVPlaybackStatus) => {
      if (!status.isLoaded) return;
      const loadedNaturalSize = (
        status as AVPlaybackStatusSuccess & {
          naturalSize?: { width: number; height: number };
        }
      ).naturalSize;
      if (loadedNaturalSize?.width && loadedNaturalSize.height) {
        setNaturalSize({
          width: loadedNaturalSize.width,
          height: loadedNaturalSize.height,
        });
      }
      void applyVideoVolume();
      if (pendingPlayRef.current) {
        void startPlayback();
      }
    },
    [applyVideoVolume, startPlayback],
  );

  const reportNaturalSize = useCallback((width: number, height: number) => {
    if (width > 0 && height > 0) {
      setNaturalSize({ width, height });
    }
  }, []);

  const seekTo = useCallback(
    async (ms: number, shouldPlay?: boolean) => {
      const video = videoRef.current;
      if (!video) return;
      const combined = Math.max(durationMs, audioDurationMs ?? 0, 1);
      const target = Math.max(0, Math.min(ms, combined));
      const videoCap = durationMs > 0 ? durationMs : combined;
      const videoPos = Math.min(target, videoCap);
      endedLatchRef.current = false;
      voiceExtendedFinishRef.current = false;
      videoEndedVoiceContinuesRef.current = target > videoCap + 40;
      await video.setPositionAsync(videoPos);
      if (target >= videoCap - 40) {
        await video.pauseAsync().catch(() => undefined);
      }
      setPositionMs(target);
      const playVoice =
        shouldPlay ??
        (await video.getStatusAsync().then((s) => s.isLoaded && s.isPlaying));
      await syncVoiceover(target, Boolean(playVoice), true);
      if (playVoice) {
        setIsPlaying(true);
        setPlaybackPhase('playing');
      } else {
        setIsPlaying(false);
        setPlaybackPhase('paused');
      }
    },
    [audioDurationMs, durationMs, syncVoiceover],
  );

  const replay = useCallback(async () => {
    endedLatchRef.current = false;
    voiceExtendedFinishRef.current = false;
    videoEndedVoiceContinuesRef.current = false;
    await seekTo(0, false);
    await startPlayback();
  }, [seekTo, startPlayback]);

  const togglePlayPause = useCallback(async () => {
    if (endedLatchRef.current) {
      await replay();
      return;
    }
    const video = videoRef.current;
    if (!video) return;
    const status = await video.getStatusAsync();
    if (!status.isLoaded) {
      await startPlayback();
      return;
    }
    if (status.isPlaying) {
      await video.pauseAsync();
      await syncVoiceover(status.positionMillis, false, true);
      setIsPlaying(false);
      setPlaybackPhase('paused');
    } else {
      const pos = status.positionMillis ?? 0;
      await video.setVolumeAsync(muted ? 0 : originalVolume);
      await video.playAsync();
      await syncVoiceover(pos, true, true);
      setIsPlaying(true);
      setPlaybackPhase('playing');
    }
  }, [muted, originalVolume, replay, startPlayback, syncVoiceover]);

  const beginScrub = useCallback(async () => {
    wasPlayingBeforeScrubRef.current = isPlaying;
    scrubbingRef.current = true;
    const video = videoRef.current;
    if (!video) return;
    const status = await video.getStatusAsync();
    if (status.isLoaded && status.isPlaying) {
      await video.pauseAsync();
      await syncVoiceover(status.positionMillis, false, true);
      setIsPlaying(false);
      setPlaybackPhase('paused');
    }
  }, [isPlaying, syncVoiceover]);

  const scrubTo = useCallback(
    async (ms: number) => {
      await seekTo(ms, false);
    },
    [seekTo],
  );

  const endScrub = useCallback(
    async (ms: number) => {
      scrubbingRef.current = false;
      await seekTo(ms, wasPlayingBeforeScrubRef.current);
    },
    [seekTo],
  );

  const toggleMute = useCallback(() => {
    setMuted((value) => {
      const nextMuted = !value;
      void (async () => {
        const video = videoRef.current;
        if (!video) return;
        if (!nextMuted && originalVolume <= 0) {
          const restore = preMuteOriginalRef.current > 0 ? preMuteOriginalRef.current : 1;
          await video.setVolumeAsync(restore);
          return;
        }
        if (nextMuted && originalVolume > 0) {
          preMuteOriginalRef.current = originalVolume;
        }
        const vol = nextMuted ? 0 : originalVolume > 0 ? originalVolume : preMuteOriginalRef.current;
        await video.setVolumeAsync(vol);
      })();
      return nextMuted;
    });
  }, [originalVolume]);

  const requestAutoPlay = useCallback(() => {
    pendingPlayRef.current = true;
    if (isLoaded) {
      void startPlayback();
    }
  }, [isLoaded, startPlayback]);

  useEffect(() => {
    if (!active) return;
    void applyVideoVolume();
    void applyVoiceoverVolume();
  }, [active, applyVideoVolume, applyVoiceoverVolume, originalVolume, voiceoverVolume]);

  return useMemo(
    () => ({
      videoRef,
      isPlaying,
      isLoaded,
      playbackPhase,
      positionMs,
      durationMs,
      combinedDurationMs,
      togglePlayPause,
      seekTo,
      beginScrub,
      scrubTo,
      endScrub,
      replay,
      toggleMute,
      muted,
      cleanup,
      onPlaybackStatusUpdate,
      applyVideoVolume,
      applyVoiceoverVolume,
      requestAutoPlay,
      handleVideoLoad,
      reportNaturalSize,
      naturalSize,
    }),
    [
      applyVideoVolume,
      applyVoiceoverVolume,
      beginScrub,
      cleanup,
      combinedDurationMs,
      durationMs,
      endScrub,
      handleVideoLoad,
      isLoaded,
      isPlaying,
      muted,
      naturalSize,
      onPlaybackStatusUpdate,
      playbackPhase,
      positionMs,
      replay,
      reportNaturalSize,
      requestAutoPlay,
      scrubTo,
      seekTo,
      toggleMute,
      togglePlayPause,
    ],
  );
}
