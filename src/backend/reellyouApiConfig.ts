/** Base URL for Reelyou server — never includes secrets. */
export function resolveReellyouApiBaseUrl(): string | null {
  const raw = process.env.EXPO_PUBLIC_REELYOU_API_URL?.trim();
  if (!raw) return null;
  return raw.replace(/\/$/, '');
}

export function isReellyouBackendConfigured(): boolean {
  return resolveReellyouApiBaseUrl() != null;
}
