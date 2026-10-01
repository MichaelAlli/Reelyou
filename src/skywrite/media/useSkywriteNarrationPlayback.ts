import { Audio } from 'expo-av';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';

import { resolveVoiceoverVolume } from '@/skywrite/media/skywriteVoiceoverVolume';
import type { SkywriteMedia } from '@/skywrite/types';

export function useSkywriteNarrationPlayback(active: boolean) {
  const soundRef = useRef<Audio.Sound | null>(null);
  const finishHandlerRef = useRef<(() => void) | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [positionMs, setPositionMs] = useState(0);
  const [durationMs, setDurationMs] = useState(0);

  const unload = useCallback(async () => {
    const sound = soundRef.current;
    soundRef.current = null;
    if (!sound) return;
    try {
      await sound.stopAsync();
      await sound.unloadAsync();
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

  useEffect(() => () => {
    void unload();
  }, [unload]);

  const playUri = useCallback(
    async (uri: string, media: SkywriteMedia, onFinish?: () => void) => {
      finishHandlerRef.current = onFinish ?? null;
      await stop();
      try {
        if (Platform.OS !== 'web') {
          await Audio.setAudioModeAsync({ allowsRecordingIOS: false, playsInSilentModeIOS: true });
        }
        const volume = resolveVoiceoverVolume(media);
        const { sound } = await Audio.Sound.createAsync(
          { uri },
          { shouldPlay: true, volume, progressUpdateIntervalMillis: 200 },
          (status) => {
            if (!status.isLoaded) return;
            setPositionMs(status.positionMillis);
            if (status.durationMillis != null) setDurationMs(status.durationMillis);
            setIsPlaying(status.isPlaying);
            if (status.didJustFinish) {
              setIsPlaying(false);
              finishHandlerRef.current?.();
              finishHandlerRef.current = null;
              void unload();
            }
          },
        );
        soundRef.current = sound;
        setIsPlaying(true);
      } catch {
        setIsPlaying(false);
        await unload();
      }
    },
    [stop, unload],
  );

  const togglePlayPause = useCallback(async () => {
    const sound = soundRef.current;
    if (!sound) return;
    const status = await sound.getStatusAsync();
    if (!status.isLoaded) return;
    if (status.isPlaying) {
      await sound.pauseAsync();
      setIsPlaying(false);
    } else {
      await sound.playAsync();
      setIsPlaying(true);
    }
  }, []);

  const setVolumeFromMedia = useCallback(async (media: SkywriteMedia) => {
    const sound = soundRef.current;
    if (!sound) return;
    try {
      await sound.setVolumeAsync(resolveVoiceoverVolume(media));
    } catch {
      /* not loaded */
    }
  }, []);

  return {
    isPlaying,
    positionMs,
    durationMs,
    playUri,
    togglePlayPause,
    stop,
    setVolumeFromMedia,
  };
}
