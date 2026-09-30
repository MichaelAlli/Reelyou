import { loadAccessToken } from '@/auth/reellyouAuthPersistence';
import { isReellyouBackendConfigured, resolveReellyouApiBaseUrl } from '@/backend/reellyouApiConfig';

export async function authenticatedReellyouFetch(
  path: string,
  init: RequestInit = {},
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
  return fetch(`${base}${path}`, { ...init, headers });
}
