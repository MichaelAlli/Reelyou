import { Audio, Video, type AVPlaybackStatus, type AVPlaybackStatusSuccess } from 'expo-av';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Platform } from 'react-native';

import { resolveOriginalVideoVolume } from '@/skywrite/media/skywriteOriginalVideoVolume';
import { resolveVoiceoverVolume } from '@/skywrite/media/skywriteVoiceoverVolume';
import type { SkywriteMedia, SkywriteRecord } from '@/skywrite/types';

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
  options?: { onAutoplayBlocked?: () => void },
): SkywriteImmersiveVideoPlayback {
  const videoRef = useRef<Video>(null);
  const voiceoverRef = useRef<Audio.Sound | null>(null);
  const pendingPlayRef = useRef(false);
  const preMuteOriginalRef = useRef(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [positionMs, setPositionMs] = useState(0);
  const [durationMs, setDurationMs] = useState(record?.media.video?.durationMs ?? 0);
  const [muted, setMuted] = useState(false);
  const [naturalSize, setNaturalSize] = useState<{ width: number; height: number } | null>(null);

  const media = useMemo(
    () => mediaOverride ?? record?.media,
    [mediaOverride, record?.media],
  );

  const videoUri = media?.video?.uri;

  const hasVoiceover =
    Boolean(media?.audio?.uri) &&
    (record?.mediaMode === 'video_voiceover' ||
      (Boolean(media?.video?.uri) && Boolean(media?.audio?.uri)));

  const originalVolume = videoVolumeForMedia(media);
  const voiceoverVolume = voiceoverVolumeForMedia(media);

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

  const applyVoiceoverVolume = useCallback(async () => {
    const sound = voiceoverRef.current;
    if (!sound) return;
    try {
      await sound.setVolumeAsync(voiceoverVolume);
    } catch {
      /* not loaded */
    }
  }, [voiceoverVolume]);

  const syncVoiceover = useCallback(
    async (position: number, shouldPlay: boolean) => {
      const uri = media?.audio?.uri;
      if (!hasVoiceover || !uri) return;

      if (!voiceoverRef.current) {
        const { sound } = await Audio.Sound.createAsync(
          { uri },
          { shouldPlay: false, positionMillis: position, volume: voiceoverVolume },
        );
        voiceoverRef.current = sound;
      }

      const sound = voiceoverRef.current;
      await sound.setVolumeAsync(voiceoverVolume);
      const voiceDuration = media?.audio?.durationMs;
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
    [hasVoiceover, media?.audio?.durationMs, media?.audio?.uri, voiceoverVolume],
  );

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

      if (!status.isLoaded) return 'error';

      const loaded = status as AVPlaybackStatusSuccess;
      const vol = muted ? 0 : originalVolume;
      await video.setVolumeAsync(vol);
      await video.playAsync();
      await syncVoiceover(loaded.positionMillis ?? 0, true);
      setIsPlaying(true);
      pendingPlayRef.current = false;
      return 'started';
    } catch {
      pendingPlayRef.current = false;
      setIsPlaying(false);
      options?.onAutoplayBlocked?.();
      return 'blocked';
    }
  }, [muted, originalVolume, options, syncVoiceover, videoUri]);

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

  const handleVideoLoad = useCallback(
    (status: AVPlaybackStatus) => {
      if (!status.isLoaded) return;
      const naturalSize = (
        status as AVPlaybackStatusSuccess & {
          naturalSize?: { width: number; height: number };
        }
      ).naturalSize;
      if (naturalSize?.width && naturalSize.height) {
        setNaturalSize({
          width: naturalSize.width,
          height: naturalSize.height,
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
    applyVoiceoverVolume,
    requestAutoPlay,
    handleVideoLoad,
    reportNaturalSize,
    naturalSize,
  };
}
