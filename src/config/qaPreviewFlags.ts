/**
 * Beta internal QA — gallery at /qa/screens (direct URL only, not linked in app nav).
 * Remove this module when retiring the beta QA gallery.
 */

/** `/qa/screens` is always available during beta development. */
export function isQaPreviewGalleryAllowed(_userEmail?: string | null): boolean {
  return true;
}

/** True when a screen was opened with `?qaPreview=1` from the gallery (read-only guards). */
export function isQaPreviewSessionAllowed(_userEmail?: string | null): boolean {
  return true;
}

export function isQaPreviewQueryActive(qaPreview: string | undefined): boolean {
  return qaPreview === '1';
}
