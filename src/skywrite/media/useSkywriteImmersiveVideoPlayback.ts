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

export interface SkywriteImmersiveVideoPlayback {
  videoRef: React.RefObject<Video | null>;
  isPlaying: boolean;
  isLoaded: boolean;
  positionMs: number;
  durationMs: number;
  togglePlayPause: () => Promise<void>;
  seekTo: (ms: number) => Promise<void>;
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

  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [positionMs, setPositionMs] = useState(0);
  const [durationMs, setDurationMs] = useState(record?.media.video?.durationMs ?? 0);
  const [muted, setMuted] = useState(false);
  const [naturalSize, setNaturalSize] = useState<{ width: number; height: number } | null>(null);

  const videoUri = mediaOverride?.video?.uri ?? record?.media.video?.uri;
  const audioUri = mediaOverride?.audio?.uri ?? record?.media.audio?.uri;
  const audioDurationMs = mediaOverride?.audio?.durationMs ?? record?.media.audio?.durationMs;

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
    setIsPlaying(false);
    setIsLoaded(false);
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

  const finishCombinedPlayback = useCallback(() => {
    videoEndedVoiceContinuesRef.current = false;
    voiceExtendedFinishRef.current = false;
    setIsPlaying(false);
    optionsRef.current?.onCombinedPlaybackFinished?.();
  }, []);

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
        if (videoEndedVoiceContinuesRef.current && !voiceExtendedFinishRef.current) {
          voiceExtendedFinishRef.current = true;
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
      pendingPlayRef.current = false;
      optionsRef.current?.onPlaybackStarted?.();
      return 'started';
    } catch {
      pendingPlayRef.current = false;
      setIsPlaying(false);
      optionsRef.current?.onAutoplayBlocked?.();
      return 'blocked';
    }
  }, [muted, originalVolume, syncVoiceover, videoUri]);

  const onPlaybackStatusUpdate = useCallback(
    (status: AVPlaybackStatus) => {
      if (!status.isLoaded) return;
      setIsLoaded(true);
      if (!videoEndedVoiceContinuesRef.current) {
        setIsPlaying(status.isPlaying);
        setPositionMs(status.positionMillis);
      }
      if (status.durationMillis != null) {
        setDurationMs(status.durationMillis);
      }
      if (status.didJustFinish) {
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
          })();
          return;
        }
        void stopVoiceoverEngine();
        finishCombinedPlayback();
      }
    },
    [audioDurationMs, finishCombinedPlayback, hasVoiceover, stopVoiceoverEngine, syncVoiceover],
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

  const togglePlayPause = useCallback(async () => {
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
    } else {
      const pos = status.positionMillis ?? 0;
      await video.setVolumeAsync(muted ? 0 : originalVolume);
      await video.playAsync();
      await syncVoiceover(pos, true, true);
      setIsPlaying(true);
    }
  }, [muted, originalVolume, startPlayback, syncVoiceover]);

  const seekTo = useCallback(
    async (ms: number) => {
      const video = videoRef.current;
      if (!video) return;
      await video.setPositionAsync(ms);
      setPositionMs(ms);
      const status = await video.getStatusAsync();
      const playing = status.isLoaded && status.isPlaying;
      await syncVoiceover(ms, playing, true);
    },
    [syncVoiceover],
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
      positionMs,
      durationMs,
      togglePlayPause,
      seekTo,
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
      cleanup,
      durationMs,
      handleVideoLoad,
      isLoaded,
      isPlaying,
      muted,
      naturalSize,
      onPlaybackStatusUpdate,
      positionMs,
      reportNaturalSize,
      requestAutoPlay,
      seekTo,
      toggleMute,
      togglePlayPause,
      applyVideoVolume,
      applyVoiceoverVolume,
    ],
  );
}
