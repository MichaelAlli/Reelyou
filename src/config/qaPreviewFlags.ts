declare const __DEV__: boolean | undefined;

/** Master switch — default off in production beta builds. */
export function isQaPreviewFeatureEnabled(): boolean {
  return process.env.EXPO_PUBLIC_ENABLE_QA_PREVIEW === '1';
}

function parseAllowlist(raw: string | undefined): string[] {
  if (!raw?.trim()) return [];
  return raw
    .split(',')
    .map((entry) => entry.trim().toLowerCase())
    .filter(Boolean);
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/**
 * Gallery + qaPreview=1 navigation — not URL obscurity alone.
 * - Flag must be on.
 * - __DEV__ builds: any signed-in/out dev session (internal tooling).
 * - Production: EXPO_PUBLIC_QA_PREVIEW_ALLOWLIST must include the signed-in email.
 */
export function isQaPreviewGalleryAllowed(userEmail?: string | null): boolean {
  if (!isQaPreviewFeatureEnabled()) {
    return false;
  }

  if (typeof __DEV__ !== 'undefined' && __DEV__) {
    return true;
  }

  const allowlist = parseAllowlist(process.env.EXPO_PUBLIC_QA_PREVIEW_ALLOWLIST);
  if (allowlist.length === 0) {
    return false;
  }

  if (!userEmail?.trim()) {
    return false;
  }

  return allowlist.includes(normalizeEmail(userEmail));
}

/** True when `?qaPreview=1` side effects / redirects should be isolated. */
export function isQaPreviewSessionAllowed(userEmail?: string | null): boolean {
  return isQaPreviewGalleryAllowed(userEmail);
}
