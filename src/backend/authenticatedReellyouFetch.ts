import { loadAccessToken } from '@/auth/reellyouAuthPersistence';
import { isReellyouBackendConfigured, resolveReellyouApiBaseUrl } from '@/backend/reellyouApiConfig';
import { fetchWithTimeout } from '@/backend/fetchWithTimeout';

export async function authenticatedReellyouFetch(
  path: string,
  init: RequestInit & { timeoutMs?: number } = {},
): Promise<Response | null> {
  const base = resolveReellyouApiBaseUrl();
  if (!base || !isReellyouBackendConfigured()) return null;
  const token = await loadAccessToken();
  if (!token) return null;
  const headers = new Headers(init.headers);
  headers.set('Authorization', `Bearer ${token}`);
  if (init.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  const { timeoutMs = 120_000, ...rest } = init;
  return fetchWithTimeout(`${base}${path}`, { ...rest, headers, timeoutMs });
}
