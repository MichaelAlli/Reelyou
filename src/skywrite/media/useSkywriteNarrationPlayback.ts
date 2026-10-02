import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import {
  createSkywriteAudioPlayback,
  type SkywriteAudioPlaybackError,
} from '@/skywrite/media/skywriteAudioPlayback';
import { resolveVoiceoverVolume } from '@/skywrite/media/skywriteVoiceoverVolume';
import { clampSeekTargetMs, finiteMs, sanitizeDurationMs } from '@/skywrite/media/skywritePlaybackTime';
import type { SkywriteMedia } from '@/skywrite/types';

type Engine = Awaited<ReturnType<typeof createSkywriteAudioPlayback>>;

export function useSkywriteNarrationPlayback(active: boolean) {
  const engineRef = useRef<Engine>(null);
  const loadedUriRef = useRef<string | null>(null);
  const finishHandlerRef = useRef<(() => void) | null>(null);
  const scrubbingRef = useRef(false);
  const wasPlayingBeforeScrubRef = useRef(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasEnded, setHasEnded] = useState(false);
  const [positionMs, setPositionMs] = useState(0);
  const [durationMs, setDurationMs] = useState(0);
  const [playbackError, setPlaybackError] = useState<SkywriteAudioPlaybackError | null>(null);

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

  const stop = useCallback(async () => {
    setIsPlaying(false);
    setHasEnded(false);
    setPositionMs(0);
    await unload();
  }, [unload]);

  useEffect(() => {
    if (!active) {
      void stop();
    }
  }, [active, stop]);

  useEffect(
    () => () => {
      void unload();
    },
    [unload],
  );

  const playUri = useCallback(
    async (uri: string, media: SkywriteMedia, onFinish?: () => void) => {
      finishHandlerRef.current = onFinish ?? null;
      setPlaybackError(null);
      setHasEnded(false);
      await unload();
      const volume = resolveVoiceoverVolume(media);
      const engine = await createSkywriteAudioPlayback(uri, volume, {
        onPosition: (pos, dur, playing) => {
          if (scrubbingRef.current) {
            setPositionMs(pos);
            return;
          }
          const safePos = finiteMs(pos) ?? 0;
          setPositionMs(safePos);
          const safeDur = sanitizeDurationMs(dur, media.audio?.durationMs);
          if (safeDur > 0) setDurationMs(safeDur);
          setIsPlaying(playing);
        },
        onFinish: () => {
          setIsPlaying(false);
          setHasEnded(true);
          finishHandlerRef.current?.();
          finishHandlerRef.current = null;
          void unload();
        },
        onError: (err) => {
          setPlaybackError(err);
          setIsPlaying(false);
        },
      });
      if (!engine) {
        setPlaybackError('load_failed');
        return false;
      }
      engineRef.current = engine;
      loadedUriRef.current = uri;
      if (media.audio?.durationMs) {
        setDurationMs((prev) => prev || media.audio!.durationMs!);
      }
      try {
        await engine.play();
        setIsPlaying(true);
        return true;
      } catch {
        setPlaybackError('play_failed');
        setIsPlaying(false);
        return false;
      }
    },
    [unload],
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

  const clearError = useCallback(() => setPlaybackError(null), []);

  return useMemo(
    () => ({
      isPlaying,
      hasEnded,
      positionMs,
      durationMs,
      playbackError,
      playUri,
      toggleOrPlay,
      pausePlayback,
      resumePlayback,
      seekToMs,
      beginScrub,
      endScrub,
      replay,
      stop,
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
      pausePlayback,
      playbackError,
      playUri,
      positionMs,
      replay,
      resumePlayback,
      seekToMs,
      setVolumeFromMedia,
      stop,
      toggleOrPlay,
    ],
  );
}
