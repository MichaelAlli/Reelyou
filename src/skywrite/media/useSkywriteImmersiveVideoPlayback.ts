import { Audio, Video, type AVPlaybackStatus } from 'expo-av';
import { useCallback, useEffect, useRef, useState } from 'react';

import type { SkywriteRecord, SkywriteVideoOriginalAudioState } from '@/skywrite/types';

function videoVolumeForOriginal(state: SkywriteVideoOriginalAudioState | undefined): number {
  if (state === 'off') return 0;
  if (state === 'lower') return 0.22;
  return 1;
}

export interface SkywriteImmersiveVideoPlayback {
  videoRef: React.RefObject<Video | null>;
  isPlaying: boolean;
  positionMs: number;
  durationMs: number;
  togglePlayPause: () => Promise<void>;
  seekTo: (ms: number) => Promise<void>;
  toggleMute: () => void;
  muted: boolean;
  cleanup: () => Promise<void>;
  onPlaybackStatusUpdate: (status: AVPlaybackStatus) => void;
}

export function useSkywriteImmersiveVideoPlayback(
  record: SkywriteRecord | undefined,
  active: boolean,
): SkywriteImmersiveVideoPlayback {
  const videoRef = useRef<Video>(null);
  const voiceoverRef = useRef<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [positionMs, setPositionMs] = useState(0);
  const [durationMs, setDurationMs] = useState(record?.media.video?.durationMs ?? 0);
  const [muted, setMuted] = useState(false);

  const hasVoiceover =
    Boolean(record?.media.audio?.uri) && record?.mediaMode === 'video_voiceover';

  const originalAudio = record?.media.originalVideoAudio ?? 'on';

  const cleanup = useCallback(async () => {
    setIsPlaying(false);
    setPositionMs(0);
    try {
      await videoRef.current?.stopAsync();
      await videoRef.current?.unloadAsync();
    } catch {
      /* unloaded */
    }
    if (voiceoverRef.current) {
      try {
        await voiceoverRef.current.stopAsync();
        await voiceoverRef.current.unloadAsync();
      } catch {
        /* unloaded */
      }
      voiceoverRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!active) {
      void cleanup();
    }
    return () => {
      void cleanup();
    };
  }, [active, cleanup, record?.id]);

  const syncVoiceover = useCallback(
    async (position: number, shouldPlay: boolean) => {
      const uri = record?.media.audio?.uri;
      if (!hasVoiceover || !uri) return;

      if (!voiceoverRef.current) {
        const { sound } = await Audio.Sound.createAsync(
          { uri },
          { shouldPlay: false, positionMillis: position },
        );
        voiceoverRef.current = sound;
      }

      const sound = voiceoverRef.current;
      const voiceDuration = record?.media.audio?.durationMs;
      if (voiceDuration != null && position >= voiceDuration) {
        await sound.pauseAsync();
        return;
      }

      await sound.setPositionAsync(position);
      if (shouldPlay) {
        await sound.playAsync();
      } else {
        await sound.pauseAsync();
      }
    },
    [hasVoiceover, record?.media.audio?.durationMs, record?.media.audio?.uri],
  );

  const onPlaybackStatusUpdate = useCallback(
    (status: AVPlaybackStatus) => {
      if (!status.isLoaded) return;
      setIsPlaying(status.isPlaying);
      setPositionMs(status.positionMillis);
      if (status.durationMillis != null) {
        setDurationMs(status.durationMillis);
      }
      if (status.didJustFinish) {
        void syncVoiceover(0, false);
        setIsPlaying(false);
      }
    },
    [syncVoiceover],
  );

  const togglePlayPause = useCallback(async () => {
    const video = videoRef.current;
    if (!video) return;
    const status = await video.getStatusAsync();
    if (!status.isLoaded) return;
    if (status.isPlaying) {
      await video.pauseAsync();
      await syncVoiceover(status.positionMillis, false);
    } else {
      const vol = muted ? 0 : videoVolumeForOriginal(originalAudio);
      await video.setVolumeAsync(vol);
      await video.playAsync();
      await syncVoiceover(status.positionMillis, true);
    }
  }, [muted, originalAudio, syncVoiceover]);

  const seekTo = useCallback(
    async (ms: number) => {
      const video = videoRef.current;
      if (!video) return;
      await video.setPositionAsync(ms);
      setPositionMs(ms);
      if (isPlaying) {
        await syncVoiceover(ms, true);
      } else {
        await syncVoiceover(ms, false);
      }
    },
    [isPlaying, syncVoiceover],
  );

  const toggleMute = useCallback(() => {
    setMuted((value) => {
      const nextMuted = !value;
      void (async () => {
        const video = videoRef.current;
        if (!video) return;
        const vol = nextMuted ? 0 : videoVolumeForOriginal(originalAudio);
        await video.setVolumeAsync(vol);
      })();
      return nextMuted;
    });
  }, [originalAudio]);

  const applyVideoVolume = useCallback(async () => {
    const video = videoRef.current;
    if (!video) return;
    try {
      const status = await video.getStatusAsync();
      if (!status.isLoaded) return;
      const vol = muted ? 0 : videoVolumeForOriginal(originalAudio);
      await video.setVolumeAsync(vol);
    } catch {
      /* not loaded yet */
    }
  }, [muted, originalAudio]);

  useEffect(() => {
    if (!active) return;
    void applyVideoVolume();
  }, [active, applyVideoVolume]);

  return {
    videoRef,
    isPlaying,
    positionMs,
    durationMs,
    togglePlayPause,
    seekTo,
    toggleMute,
    muted,
    cleanup,
    onPlaybackStatusUpdate,
    applyVideoVolume,
  };
}
