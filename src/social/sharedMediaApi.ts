import { authenticatedReellyouFetch } from '@/backend/authenticatedReellyouFetch';
import { resolveReellyouApiBaseUrl } from '@/backend/reellyouApiConfig';
import type { MediaAssetKind } from '@/social/sharedMediaTypes';

export type UploadSession = {
  assetId: string;
  uploadUrl: string;
  uploadHeaders: Record<string, string>;
  expiresInSec: number;
};

const accessCache = new Map<string, { url: string; expiresAt: number }>();

export async function createMediaUploadSession(input: {
  kind: MediaAssetKind;
  contentType: string;
  sizeBytes: number;
}): Promise<UploadSession | null> {
  const res = await authenticatedReellyouFetch('/v1/media/upload-sessions', {
    method: 'POST',
    body: JSON.stringify(input),
  });
  if (!res?.ok) return null;
  const body = (await res.json()) as {
    ok?: boolean;
    session?: UploadSession;
  };
  if (!body.ok || !body.session) return null;
  const base = resolveReellyouApiBaseUrl();
  const uploadUrl = body.session.uploadUrl.startsWith('http')
    ? body.session.uploadUrl
    : `${base}${body.session.uploadUrl}`;
  return { ...body.session, uploadUrl };
}

export async function completeMediaUploadSession(assetId: string): Promise<boolean> {
  const res = await authenticatedReellyouFetch(
    `/v1/media/upload-sessions/${encodeURIComponent(assetId)}/complete`,
    { method: 'POST', body: JSON.stringify({}) },
  );
  if (!res?.ok) return false;
  const body = (await res.json()) as { ok?: boolean };
  return Boolean(body.ok);
}

async function sleep(ms: number): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

export async function putUploadWithRetry(
  uploadUrl: string,
  blob: Blob,
  headers: Record<string, string>,
  attempts = 3,
): Promise<boolean> {
  let lastError: unknown;
  for (let i = 0; i < attempts; i += 1) {
    try {
      const res = await fetch(uploadUrl, {
        method: 'PUT',
        headers,
        body: blob,
      });
      if (res.ok || res.status === 204) return true;
      lastError = new Error(`upload_status_${res.status}`);
    } catch (err) {
      lastError = err;
    }
    if (i < attempts - 1) await sleep(400 * (i + 1));
  }
  console.warn('[reellyou] media upload failed after retries', lastError);
  return false;
}

export async function resolveMediaAccessUrl(assetId: string): Promise<string | null> {
  const cached = accessCache.get(assetId);
  if (cached && cached.expiresAt > Date.now() + 30_000) return cached.url;

  const res = await authenticatedReellyouFetch(
    `/v1/media/assets/${encodeURIComponent(assetId)}/access`,
    { method: 'GET' },
  );
  if (!res?.ok) return null;
  const body = (await res.json()) as {
    ok?: boolean;
    access?: { url: string; expiresAt: number };
  };
  if (!body.ok || !body.access?.url) return null;
  const url = body.access.url.startsWith('http')
    ? body.access.url
    : `${resolveReellyouApiBaseUrl()}${body.access.url}`;
  accessCache.set(assetId, { url, expiresAt: body.access.expiresAt });
  return url;
}

export function clearMediaAccessCache(): void {
  accessCache.clear();
}
