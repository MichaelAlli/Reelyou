import { authenticatedReellyouFetch } from '@/backend/authenticatedReellyouFetch';
import { isReelyouAuthConfigured } from '@/auth/reellyouAuthConfig';
import { isReelyouBackendConfigured, resolveReellyouApiBaseUrl } from '@/backend/reellyouApiConfig';

export interface ServerSkyAreaSummary {
  id: string;
  label: string;
  normalizedName: string;
  status: 'established' | 'emerging' | 'hidden';
  uniqueUserCount: number;
  promotedAt: number | null;
  sortOrder: number;
}

export async function fetchSkyAreaCatalog(options?: {
  search?: string;
  establishedOnly?: boolean;
}): Promise<ServerSkyAreaSummary[]> {
  if (!isReelyouBackendConfigured()) return [];
  const params = new URLSearchParams();
  if (options?.search?.trim()) params.set('search', options.search.trim());
  if (options?.establishedOnly) params.set('established', '1');
  const qs = params.toString();
  const base = resolveReellyouApiBaseUrl();
  if (!base) return [];
  const res = await fetch(`${base}/v1/sky-areas/catalog${qs ? `?${qs}` : ''}`);
  if (!res.ok) return [];
  const body = (await res.json()) as { areas?: ServerSkyAreaSummary[] };
  return body.areas ?? [];
}

export async function fetchMySkyAreas(): Promise<{
  skyAreaIds: string[];
  areas: ServerSkyAreaSummary[];
} | null> {
  if (!isReelyouAuthConfigured()) return null;
  const res = await authenticatedReellyouFetch('/v1/sky-areas/me', { method: 'GET' });
  if (!res?.ok) return null;
  const body = (await res.json()) as {
    skyAreaIds?: string[];
    areas?: ServerSkyAreaSummary[];
  };
  return { skyAreaIds: body.skyAreaIds ?? [], areas: body.areas ?? [] };
}

export async function saveMySkyAreas(input: {
  establishedIds: string[];
  customLabels: string[];
}): Promise<{ ok: boolean; error?: string; skyAreaIds?: string[] }> {
  if (!isReelyouAuthConfigured()) return { ok: false, error: 'auth_not_configured' };
  const res = await authenticatedReellyouFetch('/v1/sky-areas/me', {
    method: 'PUT',
    body: JSON.stringify(input),
  });
  const body = (await res.json().catch(() => ({}))) as {
    ok?: boolean;
    error?: string;
    skyAreaIds?: string[];
  };
  if (!res?.ok || body.ok !== true) {
    return { ok: false, error: body.error ?? 'server_error' };
  }
  return { ok: true, skyAreaIds: body.skyAreaIds };
}
