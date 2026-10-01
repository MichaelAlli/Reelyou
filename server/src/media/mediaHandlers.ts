import {
  completeUploadSession,
  createUploadSession,
  getMediaAsset,
  markUploadFailed,
  resolveSkywriteVisibilityForAsset,
} from './mediaRepository.js';
import { canViewerAccessMediaAsset } from '../social/contentVisibility.js';
import { createPresignedUploadUrl, createReadAccessUrl, objectExists } from './mediaStorage.js';
import type { MediaAssetKind } from './mediaTypes.js';

export async function handleCreateUploadSession(
  userId: string,
  body: { kind?: string; contentType?: string; sizeBytes?: number },
) {
  const kind = body.kind as MediaAssetKind | undefined;
  if (!kind || !['photo', 'video', 'audio', 'thumbnail'].includes(kind)) {
    return { ok: false as const, error: 'bad_request' };
  }
  const contentType = body.contentType?.trim() ?? '';
  const sizeBytes = Number(body.sizeBytes);
  const created = createUploadSession(userId, { kind, contentType, sizeBytes });
  if (!created.ok) return created;

  const { uploadUrl, uploadHeaders } = await createPresignedUploadUrl({
    storageKey: created.asset.storageKey,
    contentType: created.asset.contentType,
    sizeBytes: created.asset.sizeBytes,
  });

  return {
    ok: true as const,
    session: {
      assetId: created.asset.id,
      uploadUrl,
      uploadHeaders,
      expiresInSec: 900,
    },
  };
}

export async function handleCompleteUploadSession(userId: string, assetId: string) {
  const asset = getMediaAsset(assetId);
  if (!asset || asset.ownerUserId !== userId) {
    return { ok: false as const, error: 'not_found' };
  }
  const exists = await objectExists(asset.storageKey);
  if (!exists) {
    markUploadFailed(assetId, userId);
    return { ok: false as const, error: 'upload_missing' };
  }
  return completeUploadSession(assetId, userId);
}

export async function handleMediaAccess(userId: string, assetId: string) {
  const asset = getMediaAsset(assetId);
  if (!asset || asset.status !== 'ready' || asset.deletedAt) {
    return { ok: false as const, error: 'not_found' };
  }
  const visibility = resolveSkywriteVisibilityForAsset(asset, userId);
  const allowed = canViewerAccessMediaAsset({
    viewerId: userId,
    ownerUserId: asset.ownerUserId,
    skywriteId: asset.skywriteId,
    skywriteVisibility: visibility,
  });
  if (!allowed) return { ok: false as const, error: 'forbidden' };

  const url = await createReadAccessUrl(asset.storageKey);
  const expiresAt = Date.now() + 900_000;
  return {
    ok: true as const,
    access: {
      url,
      contentType: asset.contentType,
      expiresAt,
    },
  };
}
