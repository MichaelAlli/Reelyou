export type MediaAssetKind = 'photo' | 'video' | 'audio' | 'thumbnail';

export type MediaAssetStatus = 'pending' | 'ready' | 'failed' | 'deleted';

export interface StoredMediaAsset {
  id: string;
  ownerUserId: string;
  skywriteId: string | null;
  kind: MediaAssetKind;
  contentType: string;
  sizeBytes: number;
  storageKey: string;
  status: MediaAssetStatus;
  createdAt: number;
  deletedAt: number | null;
}

export interface CreateUploadSessionInput {
  kind: MediaAssetKind;
  contentType: string;
  sizeBytes: number;
}
