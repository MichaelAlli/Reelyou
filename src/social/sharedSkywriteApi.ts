import { authenticatedReellyouFetch } from '@/backend/authenticatedReellyouFetch';
import { isSharedSocialPersistenceEnabled } from '@/social/sharedSocialApi';
import { buildRemoteAssetPlaceholderUri } from '@/social/sharedMediaConstants';
import type { SkywriteRecord, SkywriteMediaMode } from '@/skywrite/types';
import type { Mood, Privacy } from '@/types';

export interface ServerSkywriteMediaRefs {
  photoAssetId?: string | null;
  videoAssetId?: string | null;
  audioAssetId?: string | null;
  thumbnailAssetId?: string | null;
  videoMeta?: {
    width?: number;
    height?: number;
    durationMs?: number;
    stageFit?: 'fit' | 'fill';
    framingOffsetX?: number;
    framingOffsetY?: number;
  } | null;
  originalVideoAudio?: 'on' | 'lower' | 'off';
  originalVideoVolume?: number;
  voiceoverVolume?: number;
}

export interface ServerSkywrite {
  id: string;
  authorUserId: string;
  text: string;
  createdAt: number;
  visibility: Privacy;
  mediaMode: string;
  textStyle?: string;
  userHashtags?: string[];
  mood?: Mood | null;
  showingUp?: string | null;
  skyAreaId?: string;
  intent?: string;
  animateToSky?: boolean;
  allowAIContext?: boolean;
  experiencedAt?: string;
  media: ServerSkywriteMediaRefs;
}

export function mapServerSkywriteToRecord(row: ServerSkywrite): SkywriteRecord {
  const media = row.media ?? {};
  const videoMeta = media.videoMeta ?? null;
  return {
    id: row.id,
    authorId: row.authorUserId,
    text: row.text,
    textStyle: (row.textStyle as SkywriteRecord['textStyle']) ?? 'plain',
    mediaMode: (row.mediaMode as SkywriteMediaMode) ?? 'text',
    visibility: row.visibility,
    mood: row.mood ?? null,
    showingUp: (row.showingUp as SkywriteRecord['showingUp']) ?? null,
    userHashtags: row.userHashtags ?? [],
    skyAreaId: row.skyAreaId,
    intent: row.intent as SkywriteRecord['intent'],
    animateToSky: row.animateToSky !== false,
    allowAIContext: row.allowAIContext !== false,
    createdAt: new Date(row.createdAt).toISOString(),
    experiencedAt: row.experiencedAt,
    media: {
      photo: media.photoAssetId
        ? {
            uri: buildRemoteAssetPlaceholderUri(media.photoAssetId),
            remoteAssetId: media.photoAssetId,
          }
        : null,
      video: media.videoAssetId
        ? {
            uri: buildRemoteAssetPlaceholderUri(media.videoAssetId),
            remoteAssetId: media.videoAssetId,
            width: videoMeta?.width,
            height: videoMeta?.height,
            durationMs: videoMeta?.durationMs,
            stageFit: videoMeta?.stageFit,
            framingOffsetX: videoMeta?.framingOffsetX,
            framingOffsetY: videoMeta?.framingOffsetY,
            thumbnailUri: media.thumbnailAssetId
              ? buildRemoteAssetPlaceholderUri(media.thumbnailAssetId)
              : undefined,
          }
        : null,
      audio: media.audioAssetId
        ? {
            uri: buildRemoteAssetPlaceholderUri(media.audioAssetId),
            remoteAssetId: media.audioAssetId,
          }
        : null,
      originalVideoAudio: media.originalVideoAudio,
      originalVideoVolume: media.originalVideoVolume,
      voiceoverVolume: media.voiceoverVolume,
    },
  };
}

export async function publishSkywriteToServer(
  record: SkywriteRecord,
  serverMedia: ServerSkywriteMediaRefs,
): Promise<{ id: string } | null> {
  if (!isSharedSocialPersistenceEnabled()) return null;
  const res = await authenticatedReellyouFetch('/v1/content/skywrites', {
    method: 'POST',
    body: JSON.stringify({
      id: record.id,
      text: record.text,
      visibility: record.visibility,
      mediaMode: record.mediaMode,
      textStyle: record.textStyle,
      userHashtags: record.userHashtags,
      mood: record.mood,
      showingUp: record.showingUp,
      skyAreaId: record.skyAreaId,
      intent: record.intent,
      animateToSky: record.animateToSky,
      allowAIContext: record.allowAIContext,
      experiencedAt: record.experiencedAt,
      createdAt: record.createdAt,
      media: serverMedia,
    }),
  });
  if (!res?.ok) return null;
  const body = (await res.json()) as { ok?: boolean; skywrite?: ServerSkywrite };
  if (!body.ok || !body.skywrite) return null;
  return { id: body.skywrite.id };
}

export async function fetchAuthorSkywritesFromServer(
  authorUserId: string,
): Promise<SkywriteRecord[]> {
  if (!isSharedSocialPersistenceEnabled()) return [];
  const res = await authenticatedReellyouFetch(
    `/v1/content/skywrites?authorUserId=${encodeURIComponent(authorUserId)}`,
    { method: 'GET' },
  );
  if (!res?.ok) return [];
  const body = (await res.json()) as { skywrites?: ServerSkywrite[] };
  return (body.skywrites ?? []).map(mapServerSkywriteToRecord);
}

export async function fetchSkywriteFromServer(skywriteId: string): Promise<SkywriteRecord | null> {
  if (!isSharedSocialPersistenceEnabled()) return null;
  const res = await authenticatedReellyouFetch(
    `/v1/content/skywrites/${encodeURIComponent(skywriteId)}`,
    { method: 'GET' },
  );
  if (!res?.ok) return null;
  const body = (await res.json()) as { ok?: boolean; skywrite?: ServerSkywrite };
  if (!body.ok || !body.skywrite) return null;
  return mapServerSkywriteToRecord(body.skywrite);
}

export async function deleteSkywriteOnServer(skywriteId: string): Promise<boolean> {
  const res = await authenticatedReellyouFetch(
    `/v1/content/skywrites/${encodeURIComponent(skywriteId)}`,
    { method: 'DELETE' },
  );
  return Boolean(res?.ok);
}
