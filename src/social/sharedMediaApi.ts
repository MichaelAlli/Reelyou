import { authenticatedReellyouFetch } from '@/backend/authenticatedReellyouFetch';
import { FetchTimeoutError, fetchWithTimeout } from '@/backend/fetchWithTimeout';
import { resolveReellyouApiBaseUrl } from '@/backend/reellyouApiConfig';
import type { MediaAssetKind } from '@/social/sharedMediaTypes';

export type UploadSession = {
  assetId: string;
  uploadUrl: string;
  uploadHeaders: Record<string, string>;
  expiresInSec: number;
};

const accessCache = new Map<string, { url: string; expiresAt: number }>();

export type MediaUploadSessionError = 'not_signed_in' | 'api_unreachable' | 'upload_session_rejected';

export async function createMediaUploadSession(input: {
  kind: MediaAssetKind;
  contentType: string;
  sizeBytes: number;
}): Promise<
  | { ok: true; session: UploadSession }
  | { ok: false; error: MediaUploadSessionError }
> {
  const res = await authenticatedReellyouFetch('/v1/media/upload-sessions', {
    method: 'POST',
    body: JSON.stringify(input),
  });
  if (res === null) {
    return { ok: false, error: 'not_signed_in' };
  }
  if (!res.ok) {
    return { ok: false, error: 'upload_session_rejected' };
  }
  const body = (await res.json()) as {
    ok?: boolean;
    session?: UploadSession;
  };
  if (!body.ok || !body.session) {
    return { ok: false, error: 'upload_session_rejected' };
  }
  const base = resolveReellyouApiBaseUrl();
  const uploadUrl = body.session.uploadUrl.startsWith('http')
    ? body.session.uploadUrl
    : `${base}${body.session.uploadUrl}`;
  return { ok: true, session: { ...body.session, uploadUrl } };
}

export async function completeMediaUploadSession(
  assetId: string,
): Promise<{ ok: true } | { ok: false; error: 'not_signed_in' | 'upload_complete_failed' }> {
  const res = await authenticatedReellyouFetch(
    `/v1/media/upload-sessions/${encodeURIComponent(assetId)}/complete`,
    { method: 'POST', body: JSON.stringify({}) },
  );
  if (res === null) return { ok: false, error: 'not_signed_in' };
  if (!res.ok) return { ok: false, error: 'upload_complete_failed' };
  const body = (await res.json()) as { ok?: boolean };
  return body.ok ? { ok: true } : { ok: false, error: 'upload_complete_failed' };
}

async function sleep(ms: number): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

export async function putUploadWithRetry(
  uploadUrl: string,
  blob: Blob,
  headers: Record<string, string>,
  attempts = 3,
): Promise<{ ok: true } | { ok: false; status?: number }> {
  let lastError: unknown;
  for (let i = 0; i < attempts; i += 1) {
    try {
      const res = await fetchWithTimeout(uploadUrl, {
        method: 'PUT',
        headers,
        body: blob,
        timeoutMs: Math.min(300_000, 60_000 + blob.size / 20_000),
      });
      if (res.ok || res.status === 204) return { ok: true };
      lastError = new Error(`upload_status_${res.status}`);
    } catch (err) {
      lastError = err instanceof FetchTimeoutError ? new Error('upload_timeout') : err;
    }
    if (i < attempts - 1) await sleep(400 * (i + 1));
  }
  console.warn('[reellyou] media upload failed after retries', lastError);
  const statusMatch =
    lastError instanceof Error && lastError.message.startsWith('upload_status_')
      ? Number.parseInt(lastError.message.replace('upload_status_', ''), 10)
      : undefined;
  return { ok: false, status: Number.isFinite(statusMatch) ? statusMatch : undefined };
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

export function invalidateMediaAccessCache(assetId: string): void {
  accessCache.delete(assetId);
}
