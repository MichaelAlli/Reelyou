import { useCallback, useEffect, useRef, useState } from 'react';

import {
  createSkywriteAudioPlayback,
  type SkywriteAudioPlaybackEngine,
} from '@/skywrite/media/skywriteAudioPlayback';

export type AudioPreviewCallbacks = {
  onStarted?: () => void;
  onFinished?: () => void;
};

/** One manual audio preview at a time inside an overlay; stops when overlay closes. */
export function useOverlayAudioPreviewScope(overlayVisible: boolean) {
  const engineRef = useRef<SkywriteAudioPlaybackEngine | null>(null);
  const finishRef = useRef<(() => void) | null>(null);
  const [activePreviewId, setActivePreviewId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);

  const unloadEngine = useCallback(async () => {
    const engine = engineRef.current;
    engineRef.current = null;
    finishRef.current = null;
    if (!engine) return;
    try {
      await engine.stop();
    } catch {
      /* quiet */
    }
  }, []);

  const stopAll = useCallback(async () => {
    setIsPlaying(false);
    setActivePreviewId(null);
    setPreviewError(null);
    await unloadEngine();
  }, [unloadEngine]);

  useEffect(() => {
    if (!overlayVisible) {
      void stopAll();
    }
  }, [overlayVisible, stopAll]);

  useEffect(() => {
    return () => {
      void unloadEngine();
    };
  }, [unloadEngine]);

  const togglePreview = useCallback(
    async (previewId: string, uri: string, callbacks?: AudioPreviewCallbacks) => {
      if (activePreviewId === previewId && isPlaying) {
        await stopAll();
        return;
      }

      await stopAll();
      setPreviewError(null);
      finishRef.current = callbacks?.onFinished ?? null;

      const engine = await createSkywriteAudioPlayback(uri, 1, {
        onPosition: (_pos, _dur, playing) => {
          setIsPlaying(playing);
        },
        onFinish: () => {
          setIsPlaying(false);
          setActivePreviewId(null);
          finishRef.current?.();
          finishRef.current = null;
          void unloadEngine();
        },
        onError: () => {
          setPreviewError('Could not play this recording. Try re-recording or tap again.');
          setIsPlaying(false);
          setActivePreviewId(null);
          void unloadEngine();
        },
      });
      if (!engine) {
        setPreviewError('Could not load audio for playback.');
        return;
      }
      engineRef.current = engine;
      setActivePreviewId(previewId);
      try {
        await engine.play();
        setIsPlaying(true);
        callbacks?.onStarted?.();
      } catch {
        setPreviewError('Playback was blocked. Tap play again.');
        setIsPlaying(false);
        setActivePreviewId(null);
        await unloadEngine();
      }
    },
    [activePreviewId, isPlaying, stopAll, unloadEngine],
  );

  const isPreviewPlaying = useCallback(
    (previewId: string) => activePreviewId === previewId && isPlaying,
    [activePreviewId, isPlaying],
  );

  return {
    togglePreview,
    stopAll,
    isPreviewPlaying,
    previewError,
    clearPreviewError: () => setPreviewError(null),
  };
}
