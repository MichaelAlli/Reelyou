import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import {
  createSkywriteAudioPlayback,
  type SkywriteAudioPlaybackError,
} from '@/skywrite/media/skywriteAudioPlayback';
import { resolveVoiceoverVolume } from '@/skywrite/media/skywriteVoiceoverVolume';
import { clampSeekTargetMs, finiteMs, sanitizeDurationMs } from '@/skywrite/media/skywritePlaybackTime';
import type { SkywriteMedia } from '@/skywrite/types';

type Engine = Awaited<ReturnType<typeof createSkywriteAudioPlayback>>;

export type SkywriteNarrationPlaybackPhase =
  | 'idle'
  | 'loading'
  | 'playing'
  | 'paused'
  | 'ended'
  | 'error';

export function useSkywriteNarrationPlayback(active: boolean, playbackSessionId = 0) {
  const engineRef = useRef<Engine>(null);
  const loadedUriRef = useRef<string | null>(null);
  const finishHandlerRef = useRef<(() => void) | null>(null);
  const scrubbingRef = useRef(false);
  const wasPlayingBeforeScrubRef = useRef(false);
  const sessionRef = useRef(playbackSessionId);
  const playOpRef = useRef(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasEnded, setHasEnded] = useState(false);
  const [isPreparing, setIsPreparing] = useState(false);
  const [positionMs, setPositionMs] = useState(0);
  const [durationMs, setDurationMs] = useState(0);
  const [playbackError, setPlaybackError] = useState<SkywriteAudioPlaybackError | null>(null);
  const playbackErrorRef = useRef<SkywriteAudioPlaybackError | null>(null);
  const lastUiTickRef = useRef(0);

  playbackErrorRef.current = playbackError;

  const playbackPhase: SkywriteNarrationPlaybackPhase = useMemo(() => {
    if (playbackError) return 'error';
    if (isPreparing) return 'loading';
    if (hasEnded) return 'ended';
    if (isPlaying) return 'playing';
    if (positionMs > 0) return 'paused';
    return 'idle';
  }, [hasEnded, isPlaying, isPreparing, playbackError, positionMs]);

  sessionRef.current = playbackSessionId;

  const unload = useCallback(async () => {
    const engine = engineRef.current;
    engineRef.current = null;
    loadedUriRef.current = null;
    if (!engine) return;
    try {
      await engine.stop();
    } catch {
      /* quiet */
    }
  }, []);

  const stopImmediate = useCallback(() => {
    playOpRef.current += 1;
    finishHandlerRef.current = null;
    scrubbingRef.current = false;
    setIsPlaying(false);
    setHasEnded(false);
    setIsPreparing(false);
    setPositionMs(0);
    void unload();
  }, [unload]);

  useEffect(() => {
    stopImmediate();
  }, [playbackSessionId, stopImmediate]);

  const stop = useCallback(async () => {
    stopImmediate();
  }, [stopImmediate]);

  useEffect(() => {
    if (!active) {
      void stop();
    }
  }, [active, stop]);

  const seedDurationMs = useCallback((media: SkywriteMedia) => {
    const fromMeta = sanitizeDurationMs(media.audio?.durationMs);
    if (fromMeta > 0) setDurationMs((prev) => (prev > 0 ? prev : fromMeta));
  }, []);

  useEffect(
    () => () => {
      void unload();
    },
    [unload],
  );

  const playUri = useCallback(
    async (uri: string, media: SkywriteMedia, onFinish?: () => void) => {
      const opId = ++playOpRef.current;
      const sessionAtStart = sessionRef.current;
      finishHandlerRef.current = onFinish ?? null;
      setPlaybackError(null);
      setHasEnded(false);
      setIsPreparing(true);
      setIsPlaying(false);
      seedDurationMs(media);
      await unload();
      if (opId !== playOpRef.current || sessionAtStart !== sessionRef.current) {
        setIsPreparing(false);
        return false;
      }
      const volume = resolveVoiceoverVolume(media);
      const engine = await createSkywriteAudioPlayback(uri, volume, {
        onPosition: (pos, dur, playing) => {
          if (sessionAtStart !== sessionRef.current || opId !== playOpRef.current) return;
          if (scrubbingRef.current) {
            setPositionMs(pos);
            return;
          }
          const safePos = finiteMs(pos) ?? 0;
          setPositionMs(safePos);
          const safeDur = sanitizeDurationMs(dur, media.audio?.durationMs);
          if (safeDur > 0) setDurationMs(safeDur);
          const now = Date.now();
          if (now - lastUiTickRef.current >= 150) {
            lastUiTickRef.current = now;
            if (!playbackErrorRef.current) {
              setIsPlaying(playing);
            }
          }
        },
        onFinish: () => {
          if (sessionAtStart !== sessionRef.current || opId !== playOpRef.current) return;
          setIsPlaying(false);
          setHasEnded(true);
          setIsPreparing(false);
          const finish = finishHandlerRef.current;
          finishHandlerRef.current = null;
          finish?.();
          void unload();
        },
        onError: (err) => {
          if (sessionAtStart !== sessionRef.current || opId !== playOpRef.current) return;
          playbackErrorRef.current = err;
          setPlaybackError(err);
          setIsPlaying(false);
          setHasEnded(false);
          setIsPreparing(false);
        },
      });
      if (opId !== playOpRef.current || sessionAtStart !== sessionRef.current) {
        setIsPreparing(false);
        return false;
      }
      if (!engine) {
        setPlaybackError('load_failed');
        setIsPreparing(false);
        return false;
      }
      engineRef.current = engine;
      loadedUriRef.current = uri;
      if (media.audio?.durationMs) {
        setDurationMs((prev) => prev || media.audio!.durationMs!);
      }
      try {
        await engine.play();
        if (opId !== playOpRef.current || sessionAtStart !== sessionRef.current) {
          await engine.stop().catch(() => undefined);
          setIsPreparing(false);
          return false;
        }
        setIsPlaying(true);
        setIsPreparing(false);
        return true;
      } catch {
        playbackErrorRef.current = 'play_failed';
        setPlaybackError('play_failed');
        setIsPlaying(false);
        setHasEnded(false);
        setIsPreparing(false);
        return false;
      }
    },
    [seedDurationMs, unload],
  );

  const toggleOrPlay = useCallback(
    async (uri: string, media: SkywriteMedia, onFinish?: () => void) => {
      if (hasEnded || !engineRef.current || loadedUriRef.current !== uri) {
        return playUri(uri, media, onFinish);
      }
      const engine = engineRef.current;
      if (isPlaying) {
        await engine.pause();
        setIsPlaying(false);
      } else {
        try {
          await engine.play();
          setIsPlaying(true);
          setHasEnded(false);
        } catch {
          setPlaybackError('play_failed');
        }
      }
      return true;
    },
    [hasEnded, isPlaying, playUri],
  );

  const pausePlayback = useCallback(async () => {
    const engine = engineRef.current;
    if (!engine || !isPlaying) return;
    await engine.pause();
    setIsPlaying(false);
  }, [isPlaying]);

  const resumePlayback = useCallback(async () => {
    const engine = engineRef.current;
    if (!engine || isPlaying) return;
    try {
      await engine.play();
      setIsPlaying(true);
      setPlaybackError(null);
      setHasEnded(false);
    } catch {
      setPlaybackError('play_failed');
    }
  }, [isPlaying]);

  const seekToMs = useCallback(async (ms: number, shouldPlay?: boolean) => {
    const engine = engineRef.current;
    if (!engine) return;
    const cap = sanitizeDurationMs(durationMs);
    const target = clampSeekTargetMs(ms, cap);
    if (target == null) return;
    try {
      await engine.seekToMs(target);
    } catch {
      return;
    }
    setPositionMs(target);
    setHasEnded(false);
    if (shouldPlay) {
      try {
        await engine.play();
        setIsPlaying(true);
      } catch {
        setPlaybackError('play_failed');
        setIsPlaying(false);
      }
    } else {
      await engine.pause();
      setIsPlaying(false);
    }
  }, [durationMs]);

  const beginScrub = useCallback(async () => {
    wasPlayingBeforeScrubRef.current = isPlaying;
    scrubbingRef.current = true;
    if (isPlaying) await pausePlayback();
  }, [isPlaying, pausePlayback]);

  const endScrub = useCallback(
    async (ms: number) => {
      scrubbingRef.current = false;
      await seekToMs(ms, wasPlayingBeforeScrubRef.current);
    },
    [seekToMs],
  );

  const replay = useCallback(
    async (uri: string, media: SkywriteMedia, onFinish?: () => void) => {
      return playUri(uri, media, onFinish);
    },
    [playUri],
  );

  const setVolumeFromMedia = useCallback(async (media: SkywriteMedia) => {
    const engine = engineRef.current;
    if (!engine) return;
    try {
      await engine.setVolume(resolveVoiceoverVolume(media));
    } catch {
      /* not loaded */
    }
  }, []);

  const clearError = useCallback(() => {
    playbackErrorRef.current = null;
    setPlaybackError(null);
  }, []);

  return useMemo(
    () => ({
      isPlaying,
      hasEnded,
      isPreparing,
      positionMs,
      durationMs,
      playbackError,
      playbackPhase,
      playUri,
      toggleOrPlay,
      pausePlayback,
      resumePlayback,
      seekToMs,
      beginScrub,
      endScrub,
      replay,
      stop,
      stopImmediate,
      setVolumeFromMedia,
      clearError,
    }),
    [
      beginScrub,
      clearError,
      durationMs,
      endScrub,
      hasEnded,
      isPlaying,
      isPreparing,
      pausePlayback,
      playbackError,
      playbackPhase,
      playUri,
      positionMs,
      replay,
      resumePlayback,
      seekToMs,
      setVolumeFromMedia,
      stop,
      stopImmediate,
      toggleOrPlay,
    ],
  );
}
