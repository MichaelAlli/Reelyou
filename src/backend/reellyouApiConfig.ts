/** Live Render API (matches `render.yaml` service `reellyou-api`). */
export const CANONICAL_REELYOU_API_BASE_URL = 'https://reellyou-api.onrender.com';

/**
 * Normalize common mis-set build env values (static site URL, typo subdomain).
 * Does not override explicit localhost/dev URLs.
 */
export function normalizeReellyouApiBaseUrl(raw: string): string {
  const trimmed = raw.trim().replace(/\/$/, '');
  try {
    const { hostname, protocol } = new URL(trimmed);
    if (protocol !== 'http:' && protocol !== 'https:') return trimmed;
    if (hostname === 'localhost' || hostname === '127.0.0.1') return trimmed;
    if (hostname === 'reelyou.onrender.com') return CANONICAL_REELYOU_API_BASE_URL;
    if (hostname === 'reelyou-api.onrender.com') return CANONICAL_REELYOU_API_BASE_URL;
    return trimmed;
  } catch {
    return trimmed;
  }
}

/** Base URL for Reelyou server — never includes secrets. */
export function resolveReellyouApiBaseUrl(): string | null {
  const raw = process.env.EXPO_PUBLIC_REELYOU_API_URL?.trim();
  if (!raw) return null;
  return normalizeReellyouApiBaseUrl(raw);
}

export function isReellyouBackendConfigured(): boolean {
  return resolveReellyouApiBaseUrl() != null;
}
