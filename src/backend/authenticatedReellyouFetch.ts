import { loadAccessToken } from '@/auth/reellyouAuthPersistence';
import { isReellyouBackendConfigured, resolveReellyouApiBaseUrl } from '@/backend/reellyouApiConfig';
import { FetchTimeoutError, fetchWithTimeout } from '@/backend/fetchWithTimeout';

export type AuthenticatedFetchFailure =
  | 'not_configured'
  | 'not_signed_in'
  | 'network'
  | 'timeout';

/** Last failure for diagnostics (no secrets). */
let lastAuthenticatedFetchFailure: AuthenticatedFetchFailure | null = null;

export function readLastAuthenticatedFetchFailure(): AuthenticatedFetchFailure | null {
  return lastAuthenticatedFetchFailure;
}

export function clearLastAuthenticatedFetchFailure(): void {
  lastAuthenticatedFetchFailure = null;
}

export async function authenticatedReellyouFetch(
  path: string,
  init: RequestInit & { timeoutMs?: number } = {},
): Promise<Response | null> {
  const base = resolveReellyouApiBaseUrl();
  if (!base || !isReellyouBackendConfigured()) {
    lastAuthenticatedFetchFailure = 'not_configured';
    return null;
  }
  const token = await loadAccessToken();
  if (!token) {
    lastAuthenticatedFetchFailure = 'not_signed_in';
    return null;
  }
  const headers = new Headers(init.headers);
  headers.set('Authorization', `Bearer ${token}`);
  if (init.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  const { timeoutMs = 120_000, ...rest } = init;
  try {
    clearLastAuthenticatedFetchFailure();
    return await fetchWithTimeout(`${base}${path}`, { ...rest, headers, timeoutMs });
  } catch (err) {
    lastAuthenticatedFetchFailure =
      err instanceof FetchTimeoutError ? 'timeout' : 'network';
    if (__DEV__) {
      console.warn('[reellyou-fetch]', {
        path,
        failure: lastAuthenticatedFetchFailure,
        message: err instanceof Error ? err.message : 'unknown',
      });
    }
    return null;
  }
}
