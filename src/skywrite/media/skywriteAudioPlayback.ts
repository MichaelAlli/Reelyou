import { Audio } from 'expo-av';
import { Platform } from 'react-native';

import { isLikelyLocalEphemeralAudioUri } from '@/skywrite/media/skywriteAudioUriUtils';

export { isLikelyLocalEphemeralAudioUri } from '@/skywrite/media/skywriteAudioUriUtils';

export type SkywriteAudioPlaybackError = 'load_failed' | 'play_failed' | 'unsupported';

export type SkywriteAudioPlaybackCallbacks = {
  onPosition?: (positionMs: number, durationMs: number, isPlaying: boolean) => void;
  onFinish?: () => void;
  onError?: (error: SkywriteAudioPlaybackError) => void;
};

type PlaybackEngine = {
  play: () => Promise<void>;
  pause: () => Promise<void>;
  stop: () => Promise<void>;
  setVolume: (volume: number) => Promise<void>;
};

/** Web blob/data URIs use HTMLAudio — expo-av often fails on MediaRecorder webm. */
async function createWebHtmlEngine(
  uri: string,
  volume: number,
  callbacks: SkywriteAudioPlaybackCallbacks,
): Promise<PlaybackEngine | null> {
  if (typeof window === 'undefined' || typeof window.Audio === 'undefined') return null;

  const el = new window.Audio();
  el.preload = 'auto';
  el.volume = volume;
  el.src = uri;

  let loaded = false;
  try {
    await new Promise<void>((resolve, reject) => {
      const onReady = () => {
        cleanup();
        loaded = true;
        resolve();
      };
      const onFail = () => {
        cleanup();
        reject(new Error('load_failed'));
      };
      const cleanup = () => {
        el.removeEventListener('canplaythrough', onReady);
        el.removeEventListener('loadedmetadata', onReady);
        el.removeEventListener('error', onFail);
      };
      el.addEventListener('canplaythrough', onReady, { once: true });
      el.addEventListener('loadedmetadata', onReady, { once: true });
      el.addEventListener('error', onFail, { once: true });
      el.load();
    });
  } catch {
    callbacks.onError?.('load_failed');
    return null;
  }

  if (!loaded) {
    callbacks.onError?.('load_failed');
    return null;
  }

  const tick = () => {
    const durationMs = Number.isFinite(el.duration) ? el.duration * 1000 : 0;
    callbacks.onPosition?.(el.currentTime * 1000, durationMs, !el.paused && !el.ended);
  };

  const interval = setInterval(tick, 200);
  el.onended = () => {
    clearInterval(interval);
    callbacks.onPosition?.(el.duration * 1000, el.duration * 1000, false);
    callbacks.onFinish?.();
  };

  return {
    play: async () => {
      try {
        await el.play();
        tick();
      } catch {
        callbacks.onError?.('play_failed');
        throw new Error('play_failed');
      }
    },
    pause: async () => {
      el.pause();
      tick();
    },
    stop: async () => {
      clearInterval(interval);
      el.pause();
      el.src = '';
      tick();
    },
    setVolume: async (v: number) => {
      el.volume = v;
    },
  };
}

async function createExpoAvEngine(
  uri: string,
  volume: number,
  callbacks: SkywriteAudioPlaybackCallbacks,
): Promise<PlaybackEngine | null> {
  try {
    if (Platform.OS !== 'web') {
      await Audio.setAudioModeAsync({ allowsRecordingIOS: false, playsInSilentModeIOS: true });
    }
    const { sound } = await Audio.Sound.createAsync(
      { uri },
      { shouldPlay: false, volume, progressUpdateIntervalMillis: 200 },
      (status) => {
        if (!status.isLoaded) return;
        callbacks.onPosition?.(
          status.positionMillis,
          status.durationMillis ?? 0,
          status.isPlaying,
        );
        if (status.didJustFinish) {
          callbacks.onFinish?.();
        }
      },
    );
    return {
      play: async () => {
        await sound.playAsync();
      },
      pause: async () => {
        await sound.pauseAsync();
      },
      stop: async () => {
        await sound.stopAsync().catch(() => undefined);
        await sound.unloadAsync().catch(() => undefined);
      },
      setVolume: async (v: number) => {
        await sound.setVolumeAsync(v);
      },
    };
  } catch {
    callbacks.onError?.('load_failed');
    return null;
  }
}

export async function createSkywriteAudioPlayback(
  uri: string,
  volume: number,
  callbacks: SkywriteAudioPlaybackCallbacks,
): Promise<PlaybackEngine | null> {
  if (Platform.OS === 'web' && isLikelyLocalEphemeralAudioUri(uri)) {
    const web = await createWebHtmlEngine(uri, volume, callbacks);
    if (web) return web;
  }
  const expo = await createExpoAvEngine(uri, volume, callbacks);
  if (expo) return expo;
  if (Platform.OS === 'web') {
    return createWebHtmlEngine(uri, volume, callbacks);
  }
  return null;
}
