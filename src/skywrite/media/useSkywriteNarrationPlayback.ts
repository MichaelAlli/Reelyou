import { useCallback, useEffect, useRef, useState } from 'react';

import {
  createSkywriteAudioPlayback,
  type SkywriteAudioPlaybackError,
} from '@/skywrite/media/skywriteAudioPlayback';
import { resolveVoiceoverVolume } from '@/skywrite/media/skywriteVoiceoverVolume';
import type { SkywriteMedia } from '@/skywrite/types';

type Engine = Awaited<ReturnType<typeof createSkywriteAudioPlayback>>;

export function useSkywriteNarrationPlayback(active: boolean) {
  const engineRef = useRef<Engine>(null);
  const loadedUriRef = useRef<string | null>(null);
  const finishHandlerRef = useRef<(() => void) | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
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
      await unload();
      const volume = resolveVoiceoverVolume(media);
      const engine = await createSkywriteAudioPlayback(uri, volume, {
        onPosition: (pos, dur, playing) => {
          setPositionMs(pos);
          if (dur > 0) setDurationMs(dur);
          setIsPlaying(playing);
        },
        onFinish: () => {
          setIsPlaying(false);
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
      if (!engineRef.current || loadedUriRef.current !== uri) {
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
        } catch {
          setPlaybackError('play_failed');
        }
      }
      return true;
    },
    [isPlaying, playUri],
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
    } catch {
      setPlaybackError('play_failed');
    }
  }, [isPlaying]);

  const setVolumeFromMedia = useCallback(async (media: SkywriteMedia) => {
    const engine = engineRef.current;
    if (!engine) return;
    try {
      await engine.setVolume(resolveVoiceoverVolume(media));
    } catch {
      /* not loaded */
    }
  }, []);

  return {
    isPlaying,
    positionMs,
    durationMs,
    playbackError,
    playUri,
    toggleOrPlay,
    pausePlayback,
    resumePlayback,
    stop,
    setVolumeFromMedia,
    clearError: () => setPlaybackError(null),
  };
}
