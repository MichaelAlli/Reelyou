const APP_SCHEME = 'reellyou';

/** Beta QA — Jordan (not the logged-in owner `user-michael`). */
export const VISITOR_PROFILE_QA_OWNER_ID = 'orbit-jordan';

export const VISITOR_PROFILE_PREVIEW_PARAM = 'preview';
export const VISITOR_PREVIEW_AS_PARAM = 'previewAs';

/** Canonical Public / Visitor profile route — same param as Public Sky. */
export function buildVisitorProfileHref(
  ownerId: string,
  options?: { visitorPreview?: boolean; previewAs?: 'public' | 'connected' },
): string {
  let href = `/visitor-profile?id=${encodeURIComponent(ownerId)}`;
  if (options?.visitorPreview) {
    href += `&${VISITOR_PROFILE_PREVIEW_PARAM}=1`;
    if (options.previewAs) {
      href += `&${VISITOR_PREVIEW_AS_PARAM}=${encodeURIComponent(options.previewAs)}`;
    }
  }
  return href;
}

/** Logged-in owner viewing their own profile as another user would (visitor-safe). */
export function buildVisitorSelfPreviewHref(
  ownerUserId: string,
  options?: { previewAs?: 'public' | 'connected' },
): string {
  return buildVisitorProfileHref(ownerUserId, {
    visitorPreview: true,
    previewAs: options?.previewAs ?? 'public',
  });
}

export function resolveVisitorPreviewAsFromParams(
  value: string | string[] | undefined,
): 'public' | 'connected' | undefined {
  const raw = Array.isArray(value) ? value[0] : value;
  if (raw === 'connected') return 'connected';
  if (raw === 'public') return 'public';
  return undefined;
}

/**
 * Absolute URL for sharing — visitor-safe `/visitor-profile` route (no owner preview params).
 * Uses current web origin, optional EXPO_PUBLIC_APP_ORIGIN, or app scheme via expo-linking.
 */
export function buildShareableVisitorProfileUrl(ownerId: string): string {
  const path = buildVisitorProfileHref(ownerId);
  const configuredOrigin = process.env.EXPO_PUBLIC_APP_ORIGIN?.replace(/\/$/, '');
  if (configuredOrigin) {
    return `${configuredOrigin}${path}`;
  }
  if (typeof globalThis !== 'undefined') {
    const origin = (globalThis as { location?: { origin?: string } }).location?.origin;
    if (origin && origin !== 'null') {
      return `${origin}${path}`;
    }
  }
  const normalized = path.replace(/^\//, '');
  return `${APP_SCHEME}://${normalized}`;
}

/** Paste into Chrome during `npm run web` (default port 8090). */
export function buildVisitorProfileWebUrl(
  ownerId: string = VISITOR_PROFILE_QA_OWNER_ID,
  port = 8090,
  options?: { visitorPreview?: boolean },
): string {
  const path = buildVisitorProfileHref(ownerId, options);
  return `http://localhost:${port}${path}`;
}

export function resolveVisitorPreviewFromParams(
  preview: string | string[] | undefined,
  viewerMode: string | string[] | undefined,
): boolean {
  const rawPreview = Array.isArray(preview) ? preview[0] : preview;
  if (rawPreview === '1' || rawPreview === 'true') return true;
  const rawMode = Array.isArray(viewerMode) ? viewerMode[0] : viewerMode;
  return rawMode === 'visitorPreview';
}
