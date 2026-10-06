import { Audio } from 'expo-av';
import { Platform } from 'react-native';

import { parseRemoteAssetIdFromUri } from '@/social/sharedMediaConstants';
import { isLikelyLocalEphemeralAudioUri } from '@/skywrite/media/skywriteAudioUriUtils';
import {
  clampSeekTargetMs,
  finiteMs,
  msToMediaElementSeconds,
  sanitizeDurationMs,
} from '@/skywrite/media/skywritePlaybackTime';

export { isLikelyLocalEphemeralAudioUri } from '@/skywrite/media/skywriteAudioUriUtils';

export type SkywriteAudioPlaybackError = 'load_failed' | 'play_failed' | 'unsupported';

export type SkywriteAudioPlaybackCallbacks = {
  onPosition?: (positionMs: number, durationMs: number, isPlaying: boolean) => void;
  onFinish?: () => void;
  onError?: (error: SkywriteAudioPlaybackError) => void;
};

export type SkywriteAudioPlaybackEngine = {
  play: () => Promise<void>;
  pause: () => Promise<void>;
  stop: () => Promise<void>;
  setVolume: (volume: number) => Promise<void>;
  seekToMs: (positionMs: number) => Promise<void>;
};

/** Web blob/data URIs use HTMLAudio — expo-av often fails on MediaRecorder webm. */
async function createWebHtmlEngine(
  uri: string,
  volume: number,
  callbacks: SkywriteAudioPlaybackCallbacks,
): Promise<SkywriteAudioPlaybackEngine | null> {
  if (typeof window === 'undefined' || typeof window.Audio === 'undefined') return null;

  const el = new window.Audio();
  el.preload = 'auto';
  el.volume = volume;
  // Do not set crossOrigin for signed CDN URLs — many buckets omit ACAO and playback then fails despite HTTP 200.
  if (/\.webm(\?|$)/i.test(uri) || uri.includes('webm')) {
    el.setAttribute('type', 'audio/webm');
  } else if (/\.m4a(\?|$)/i.test(uri) || uri.includes('mp4')) {
    el.setAttribute('type', 'audio/mp4');
  } else if (/\.mp3(\?|$)/i.test(uri)) {
    el.setAttribute('type', 'audio/mpeg');
  }
  el.src = uri;

  let loaded = false;
  try {
    await new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => {
        if (el.readyState >= HTMLMediaElement.HAVE_METADATA) {
          cleanup();
          loaded = true;
          resolve();
        }
      }, 6000);
      const onReady = () => {
        clearTimeout(timeout);
        cleanup();
        loaded = true;
        resolve();
      };
      const onFail = () => {
        clearTimeout(timeout);
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
    const durationMs = sanitizeDurationMs(
      Number.isFinite(el.duration) ? el.duration * 1000 : 0,
    );
    const posMs = finiteMs(el.currentTime * 1000) ?? 0;
    callbacks.onPosition?.(posMs, durationMs, !el.paused && !el.ended);
  };

  tick();
  const interval = setInterval(tick, 150);
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
    seekToMs: async (positionMs: number) => {
      const durationCap = sanitizeDurationMs(
        Number.isFinite(el.duration) ? el.duration * 1000 : 0,
      );
      const target = clampSeekTargetMs(positionMs, durationCap);
      if (target == null) return;
      const seconds = msToMediaElementSeconds(target);
      if (seconds == null || !Number.isFinite(seconds)) return;
      try {
        el.currentTime = seconds;
      } catch {
        return;
      }
      tick();
    },
  };
}

async function createExpoAvEngine(
  uri: string,
  volume: number,
  callbacks: SkywriteAudioPlaybackCallbacks,
): Promise<SkywriteAudioPlaybackEngine | null> {
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
      seekToMs: async (positionMs: number) => {
        const status = await sound.getStatusAsync();
        const durationCap = status.isLoaded
          ? sanitizeDurationMs(status.durationMillis)
          : 0;
        const target = clampSeekTargetMs(positionMs, durationCap);
        if (target == null) return;
        await sound.setPositionAsync(target);
      },
    };
  } catch {
    callbacks.onError?.('load_failed');
    return null;
  }
}

function preferWebHtmlAudioEngine(uri: string): boolean {
  if (Platform.OS !== 'web') return false;
  if (isLikelyLocalEphemeralAudioUri(uri)) return true;
  return uri.startsWith('https://') || uri.startsWith('http://');
}

export async function createSkywriteAudioPlayback(
  uri: string,
  volume: number,
  callbacks: SkywriteAudioPlaybackCallbacks,
): Promise<SkywriteAudioPlaybackEngine | null> {
  if (!uri || parseRemoteAssetIdFromUri(uri)) {
    if (__DEV__) {
      console.warn('[skywrite-audio] playback blocked: unresolved asset placeholder URI');
    }
    callbacks.onError?.('load_failed');
    return null;
  }
  if (preferWebHtmlAudioEngine(uri)) {
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
