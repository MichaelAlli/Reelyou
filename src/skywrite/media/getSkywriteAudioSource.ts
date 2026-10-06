import {
  isEphemeralMediaUri,
  parseRemoteAssetIdFromUri,
} from '@/social/sharedMediaConstants';
import { isStandaloneAudioSkywrite } from '@/skywrite/standaloneAudioSkywrite';
import type { SkywriteAudioMedia, SkywriteRecord } from '@/skywrite/types';

/** Canonical persisted audio — `media.audio.uri` (+ `remoteAssetId`, `durationMs`). */
export interface SkywriteAudioSource {
  uri: string | null;
  remoteAssetId: string | null;
  durationMs: number | undefined;
  /** Standalone voice post (not photo/video/text voiceover). */
  standalone: boolean;
}

export function isAudioOnlySkywrite(
  record: Pick<SkywriteRecord, 'text' | 'media' | 'mediaMode'>,
): boolean {
  if (!record.media.audio?.uri && !record.media.audio?.remoteAssetId) return false;
  return isStandaloneAudioSkywrite(record);
}

export function getSkywriteAudioSource(
  record: Pick<SkywriteRecord, 'text' | 'media' | 'mediaMode'>,
): SkywriteAudioSource {
  const audio = record.media.audio;
  const uri = audio?.uri ?? null;
  const remoteAssetId =
    audio?.remoteAssetId ?? parseRemoteAssetIdFromUri(uri) ?? null;
  return {
    uri,
    remoteAssetId,
    durationMs: audio?.durationMs,
    standalone: isStandaloneAudioSkywrite(record),
  };
}

/** Signed URL resolution required before HTML/expo-av can play. */
export function skywriteAudioNeedsRemoteResolve(
  record: Pick<SkywriteRecord, 'media'>,
): boolean {
  const { uri, remoteAssetId } = getSkywriteAudioSource(record);
  if (!uri && !remoteAssetId) return false;
  if (parseRemoteAssetIdFromUri(uri)) return true;
  if (remoteAssetId && (!uri || parseRemoteAssetIdFromUri(uri))) return true;
  return false;
}

/** Durable across refresh — remote asset id or non-ephemeral https URI. */
export function hasPersistedSkywriteAudioAsset(record: SkywriteRecord): boolean {
  const { uri, remoteAssetId } = getSkywriteAudioSource(record);
  if (remoteAssetId) return true;
  if (!uri) return false;
  if (parseRemoteAssetIdFromUri(uri)) return true;
  if (uri.startsWith('https://') && !isEphemeralMediaUri(uri)) return true;
  return false;
}

/** URI safe for expo-av / HTML audio (not an unresolved `reelyou-asset://` placeholder). */
export function getSkywritePlayableAudioUri(
  record: Pick<SkywriteRecord, 'media'>,
): string | null {
  const { uri } = getSkywriteAudioSource(record);
  if (!uri) return null;
  if (parseRemoteAssetIdFromUri(uri)) return null;
  return uri;
}

export function logSkyReelAudioInDev(
  record: Pick<SkywriteRecord, 'id' | 'media' | 'mediaMode' | 'text'>,
  context: string,
  extra?: Record<string, unknown>,
): void {
  if (!__DEV__) return;
  const src = getSkywriteAudioSource(record);
  const playable = getSkywritePlayableAudioUri(record);
  console.log('[skyreel-audio]', {
    context,
    skywriteId: record.id,
    standalone: src.standalone,
    uri: src.uri,
    playableUri: playable,
    remoteAssetId: src.remoteAssetId,
    durationMs: src.durationMs,
    ...extra,
  });
}

export function logMissingSkywriteAudioInDev(
  record: Pick<SkywriteRecord, 'id' | 'media' | 'mediaMode'>,
  context: string,
): void {
  if (!__DEV__) return;
  const src = getSkywriteAudioSource(record);
  if (src.uri || src.remoteAssetId) return;
  console.warn(`[skywrite-audio] ${context}: no audio source for ${record.id}`);
}

export function logUnrecoverableSkywriteAudioInDev(
  record: Pick<SkywriteRecord, 'id' | 'media'>,
  context: string,
): void {
  if (!__DEV__) return;
  const { uri, remoteAssetId } = getSkywriteAudioSource(record);
  if (remoteAssetId) return;
  if (uri && isEphemeralMediaUri(uri)) {
    console.warn(
      `[skywrite-audio] ${context}: ephemeral-only audio for ${record.id} — may not survive reload`,
    );
  }
}

export function mergeSkywriteAudioMedia(
  local: SkywriteAudioMedia | null,
  remote: SkywriteAudioMedia | null,
): SkywriteAudioMedia | null {
  if (!local && !remote) return null;
  if (!remote) return local;
  if (!local) return remote;
  const durationMs =
    (remote.durationMs && remote.durationMs > 0 ? remote.durationMs : undefined) ??
    (local.durationMs && local.durationMs > 0 ? local.durationMs : undefined);
  return {
    ...remote,
    ...local,
    uri: remote.remoteAssetId ? remote.uri : (local.uri ?? remote.uri),
    remoteAssetId: remote.remoteAssetId ?? local.remoteAssetId,
    durationMs,
  };
}
