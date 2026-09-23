import { Audio } from 'expo-av';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';

/** One manual audio preview at a time inside an overlay; stops when overlay closes. */
export function useOverlayAudioPreviewScope(overlayVisible: boolean) {
  const soundRef = useRef<Audio.Sound | null>(null);
  const [activePreviewId, setActivePreviewId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const unloadSound = useCallback(async () => {
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

  const stopAll = useCallback(async () => {
    setIsPlaying(false);
    setActivePreviewId(null);
    await unloadSound();
  }, [unloadSound]);

  useEffect(() => {
    if (!overlayVisible) {
      void stopAll();
    }
  }, [overlayVisible, stopAll]);

  useEffect(() => {
    return () => {
      void unloadSound();
    };
  }, [unloadSound]);

  const togglePreview = useCallback(
    async (previewId: string, uri: string) => {
      if (activePreviewId === previewId && isPlaying) {
        await unloadSound();
        setIsPlaying(false);
        setActivePreviewId(null);
        return;
      }

      await stopAll();

      try {
        if (Platform.OS !== 'web') {
          await Audio.setAudioModeAsync({
            allowsRecordingIOS: false,
            playsInSilentModeIOS: true,
          });
        }
        const { sound } = await Audio.Sound.createAsync(
          { uri },
          { shouldPlay: true },
          (status) => {
            if (!status.isLoaded) return;
            if (status.didJustFinish) {
              setIsPlaying(false);
              setActivePreviewId(null);
              void unloadSound();
            }
          },
        );
        soundRef.current = sound;
        setActivePreviewId(previewId);
        setIsPlaying(true);
      } catch {
        setIsPlaying(false);
        setActivePreviewId(null);
        await unloadSound();
      }
    },
    [activePreviewId, isPlaying, stopAll, unloadSound],
  );

  const isPreviewPlaying = useCallback(
    (previewId: string) => activePreviewId === previewId && isPlaying,
    [activePreviewId, isPlaying],
  );

  return {
    togglePreview,
    stopAll,
    isPreviewPlaying,
  };
}
