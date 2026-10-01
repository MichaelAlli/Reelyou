import { randomUUID } from 'node:crypto';

import { loadAccountDatabase, persistAccountDatabase } from '../db/accountStore.js';
import { getSkywrite } from '../social/socialRepository.js';
import { SKYWRITE_RECOVERY_WINDOW_MS } from '../social/skywriteDeletionConstants.js';
import type { StoredSkywriteMediaRefs } from '../social/skywriteTypes.js';
import { extensionForContentType, buildStorageKey } from './mediaStorage.js';
import { validateUploadRequest } from './mediaLimits.js';
import type { CreateUploadSessionInput, MediaAssetKind, StoredMediaAsset } from './mediaTypes.js';

function db() {
  const store = loadAccountDatabase();
  if (!store.mediaAssets) store.mediaAssets = [];
  return store;
}

export function getMediaAsset(assetId: string): StoredMediaAsset | undefined {
  return db().mediaAssets!.find((a) => a.id === assetId && a.deletedAt == null);
}

export function getMediaAssetByStorageKey(storageKey: string): StoredMediaAsset | undefined {
  return db().mediaAssets!.find((a) => a.storageKey === storageKey && a.deletedAt == null);
}

export function createUploadSession(
  ownerUserId: string,
  input: CreateUploadSessionInput,
): { ok: true; asset: StoredMediaAsset } | { ok: false; error: string } {
  const check = validateUploadRequest(input.kind, input.contentType, input.sizeBytes);
  if (!check.ok) return check;

  const id = randomUUID();
  const ext = extensionForContentType(input.contentType);
  const storageKey = buildStorageKey(ownerUserId, id, ext);
  const asset: StoredMediaAsset = {
    id,
    ownerUserId,
    skywriteId: null,
    kind: input.kind,
    contentType: input.contentType.split(';')[0]?.trim().toLowerCase() ?? input.contentType,
    sizeBytes: input.sizeBytes,
    storageKey,
    status: 'pending',
    createdAt: Date.now(),
    deletedAt: null,
  };
  db().mediaAssets!.push(asset);
  persistAccountDatabase();
  return { ok: true, asset };
}

export function markUploadFailed(assetId: string, ownerUserId: string): void {
  const asset = getMediaAsset(assetId);
  if (!asset || asset.ownerUserId !== ownerUserId) return;
  asset.status = 'failed';
  persistAccountDatabase();
}

export function completeUploadSession(
  assetId: string,
  ownerUserId: string,
): { ok: true; asset: StoredMediaAsset } | { ok: false; error: string } {
  const asset = getMediaAsset(assetId);
  if (!asset || asset.ownerUserId !== ownerUserId) return { ok: false, error: 'not_found' };
  if (asset.status === 'deleted') return { ok: false, error: 'deleted' };
  asset.status = 'ready';
  persistAccountDatabase();
  return { ok: true, asset };
}

export function attachAssetsToSkywrite(
  skywriteId: string,
  ownerUserId: string,
  refs: StoredSkywriteMediaRefs,
): void {
  const ids = [
    refs.photoAssetId,
    refs.videoAssetId,
    refs.audioAssetId,
    refs.thumbnailAssetId,
  ].filter((id): id is string => Boolean(id));

  for (const id of ids) {
    const asset = getMediaAsset(id);
    if (!asset || asset.ownerUserId !== ownerUserId) continue;
    asset.skywriteId = skywriteId;
  }
  persistAccountDatabase();
}

export function softDeleteMediaForSkywrite(skywriteId: string, ownerUserId: string): string[] {
  const keys: string[] = [];
  const now = Date.now();
  for (const asset of db().mediaAssets!) {
    if (asset.skywriteId !== skywriteId || asset.ownerUserId !== ownerUserId) continue;
    asset.deletedAt = now;
    asset.status = 'deleted';
    keys.push(asset.storageKey);
  }
  persistAccountDatabase();
  return keys;
}

export async function purgeMediaForSkywrite(
  skywriteId: string,
  ownerUserId: string,
): Promise<void> {
  const { deleteObject } = await import('./mediaStorage.js');
  const keys = softDeleteMediaForSkywrite(skywriteId, ownerUserId);
  await Promise.all(keys.map((key) => deleteObject(key).catch(() => undefined)));
}

export function assertAssetsReadyForPublish(
  ownerUserId: string,
  refs: StoredSkywriteMediaRefs,
): { ok: true } | { ok: false; error: string } {
  const pairs: [MediaAssetKind, string | null | undefined][] = [
    ['photo', refs.photoAssetId],
    ['video', refs.videoAssetId],
    ['audio', refs.audioAssetId],
    ['thumbnail', refs.thumbnailAssetId],
  ];
  for (const [kind, id] of pairs) {
    if (!id) continue;
    const asset = getMediaAsset(id);
    if (!asset || asset.ownerUserId !== ownerUserId) return { ok: false, error: 'invalid_asset' };
    if (asset.status !== 'ready') return { ok: false, error: 'asset_not_ready' };
    if (asset.kind !== kind && !(kind === 'thumbnail' && asset.kind === 'photo')) {
      return { ok: false, error: 'asset_kind_mismatch' };
    }
  }
  return { ok: true };
}

export function resolveSkywriteVisibilityForAsset(
  asset: StoredMediaAsset,
  viewerId?: string,
): import('../social/skywriteTypes.js').SkywriteVisibility | null {
  if (!asset.skywriteId) return null;
  const sw = db().skywrites?.find((s) => s.id === asset.skywriteId);
  if (!sw) return null;
  if (sw.deletedAt) {
    const purgeAfter = sw.deletionPurgeAfter ?? sw.deletedAt + SKYWRITE_RECOVERY_WINDOW_MS;
    if (Date.now() >= purgeAfter) return null;
    if (viewerId === sw.authorUserId) return sw.visibility;
    return null;
  }
  return sw.visibility;
}
