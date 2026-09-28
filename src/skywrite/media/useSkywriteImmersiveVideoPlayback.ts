import { Audio, Video, type AVPlaybackStatus, type AVPlaybackStatusSuccess } from 'expo-av';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';

import type { SkywriteRecord, SkywriteVideoOriginalAudioState } from '@/skywrite/types';

function videoVolumeForOriginal(state: SkywriteVideoOriginalAudioState | undefined): number {
  if (state === 'off') return 0;
  if (state === 'lower') return 0.22;
  return 1;
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
  requestAutoPlay: () => void;
}

export function useSkywriteImmersiveVideoPlayback(
  record: SkywriteRecord | undefined,
  active: boolean,
): SkywriteImmersiveVideoPlayback {
  const videoRef = useRef<Video>(null);
  const voiceoverRef = useRef<Audio.Sound | null>(null);
  const pendingPlayRef = useRef(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [positionMs, setPositionMs] = useState(0);
  const [durationMs, setDurationMs] = useState(record?.media.video?.durationMs ?? 0);
  const [muted, setMuted] = useState(false);

  const videoUri = record?.media.video?.uri;

  const hasVoiceover =
    Boolean(record?.media.audio?.uri) && record?.mediaMode === 'video_voiceover';

  const originalAudio = record?.media.originalVideoAudio ?? 'on';

  const cleanup = useCallback(async () => {
    pendingPlayRef.current = false;
    setIsPlaying(false);
    setIsLoaded(false);
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

  const startPlayback = useCallback(async () => {
    const video = videoRef.current;
    if (!video || !videoUri) return;

    let status = await video.getStatusAsync();
    if (!status.isLoaded) {
      pendingPlayRef.current = true;
      await video.loadAsync(
        { uri: videoUri },
        { shouldPlay: false, progressUpdateIntervalMillis: 250 },
      );
      status = await video.getStatusAsync();
    }

    if (!status.isLoaded) return;

    const loaded = status as AVPlaybackStatusSuccess;
    const vol = muted ? 0 : videoVolumeForOriginal(originalAudio);
    await video.setVolumeAsync(vol);
    await video.playAsync();
    await syncVoiceover(loaded.positionMillis ?? 0, true);
    setIsPlaying(true);
    pendingPlayRef.current = false;
  }, [muted, originalAudio, syncVoiceover, videoUri]);

  const onPlaybackStatusUpdate = useCallback(
    (status: AVPlaybackStatus) => {
      if (!status.isLoaded) return;
      setIsLoaded(true);
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
    if (!status.isLoaded) {
      await startPlayback();
      return;
    }
    if (status.isPlaying) {
      await video.pauseAsync();
      await syncVoiceover(status.positionMillis, false);
      setIsPlaying(false);
    } else {
      await startPlayback();
    }
  }, [startPlayback, syncVoiceover]);

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

  const requestAutoPlay = useCallback(() => {
    pendingPlayRef.current = true;
    if (isLoaded) {
      void startPlayback();
    }
  }, [isLoaded, startPlayback]);

  useEffect(() => {
    if (!active) return;
    void applyVideoVolume();
  }, [active, applyVideoVolume]);

  return {
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
    requestAutoPlay,
  };
}
