import { authenticatedReellyouFetch, readLastAuthenticatedFetchFailure } from '@/backend/authenticatedReellyouFetch';
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
const accessInFlight = new Map<string, Promise<string | null>>();

export type MediaUploadSessionError = 'not_signed_in' | 'api_unreachable' | 'upload_session_rejected';

export type MediaAccessFailure =
  | 'not_signed_in'
  | 'not_configured'
  | 'network'
  | 'timeout'
  | 'not_found'
  | 'forbidden'
  | 'invalid_response';

export type MediaAccessResult =
  | { ok: true; url: string }
  | { ok: false; failure: MediaAccessFailure };

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
    const failure = readLastAuthenticatedFetchFailure();
    return {
      ok: false,
      error: failure === 'not_signed_in' ? 'not_signed_in' : 'api_unreachable',
    };
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
  if (res === null) {
    return {
      ok: false,
      error: readLastAuthenticatedFetchFailure() === 'not_signed_in' ? 'not_signed_in' : 'upload_complete_failed',
    };
  }
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

async function fetchMediaAccessUrlOnce(assetId: string): Promise<MediaAccessResult> {
  const res = await authenticatedReellyouFetch(
    `/v1/media/assets/${encodeURIComponent(assetId)}/access`,
    { method: 'GET', timeoutMs: 45_000 },
  );
  if (res === null) {
    const failure = readLastAuthenticatedFetchFailure();
    if (failure === 'not_signed_in') return { ok: false, failure: 'not_signed_in' };
    if (failure === 'not_configured') return { ok: false, failure: 'not_configured' };
    if (failure === 'timeout') return { ok: false, failure: 'timeout' };
    return { ok: false, failure: 'network' };
  }
  if (res.status === 401 || res.status === 403) {
    return { ok: false, failure: res.status === 401 ? 'not_signed_in' : 'forbidden' };
  }
  if (!res.ok) {
    return { ok: false, failure: res.status === 404 ? 'not_found' : 'invalid_response' };
  }
  let body: { ok?: boolean; access?: { url: string; expiresAt: number }; error?: string };
  try {
    body = (await res.json()) as typeof body;
  } catch {
    return { ok: false, failure: 'invalid_response' };
  }
  if (!body.ok || !body.access?.url) {
    if (body.error === 'forbidden') return { ok: false, failure: 'forbidden' };
    if (body.error === 'not_found') return { ok: false, failure: 'not_found' };
    return { ok: false, failure: 'invalid_response' };
  }
  const base = resolveReellyouApiBaseUrl();
  const url = body.access.url.startsWith('http')
    ? body.access.url
    : `${base}${body.access.url}`;
  accessCache.set(assetId, { url, expiresAt: body.access.expiresAt });
  return { ok: true, url };
}

export async function resolveMediaAccessUrl(assetId: string): Promise<string | null> {
  const cached = accessCache.get(assetId);
  if (cached && cached.expiresAt > Date.now() + 30_000) return cached.url;

  const inFlight = accessInFlight.get(assetId);
  if (inFlight) return inFlight;

  const task = (async () => {
    const retryable = new Set<MediaAccessFailure>(['network', 'timeout']);
    for (let attempt = 0; attempt < 3; attempt += 1) {
      const result = await fetchMediaAccessUrlOnce(assetId);
      if (result.ok) return result.url;
      if (!retryable.has(result.failure) || attempt >= 2) {
        if (__DEV__) {
          console.warn('[reellyou-media-access]', { assetId, failure: result.failure });
        }
        return null;
      }
      await sleep(350 * (attempt + 1));
    }
    return null;
  })();

  accessInFlight.set(assetId, task);
  try {
    return await task;
  } finally {
    accessInFlight.delete(assetId);
  }
}

export function clearMediaAccessCache(): void {
  accessCache.clear();
}

export function invalidateMediaAccessCache(assetId: string): void {
  accessCache.delete(assetId);
}
