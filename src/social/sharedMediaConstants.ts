/** Placeholder URI persisted locally until playback resolves a signed URL. */
export const REELYOU_REMOTE_ASSET_URI_PREFIX = 'reelyou-asset://';

export function buildRemoteAssetPlaceholderUri(assetId: string): string {
  return `${REELYOU_REMOTE_ASSET_URI_PREFIX}${assetId}`;
}

export function parseRemoteAssetIdFromUri(uri: string | undefined | null): string | null {
  if (!uri?.startsWith(REELYOU_REMOTE_ASSET_URI_PREFIX)) return null;
  const id = uri.slice(REELYOU_REMOTE_ASSET_URI_PREFIX.length).trim();
  return id.length > 0 ? id : null;
}

export function isEphemeralMediaUri(uri: string | undefined | null): boolean {
  if (!uri) return false;
  return (
    uri.startsWith('blob:') ||
    uri.startsWith('data:') ||
    uri.startsWith('file:') ||
    uri.startsWith('content:') ||
    uri.startsWith('ph://') ||
    uri.startsWith('assets-library://')
  );
}
