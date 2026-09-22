/** Beta QA — Jordan (not the logged-in owner `user-michael`). */
export const VISITOR_PROFILE_QA_OWNER_ID = 'orbit-jordan';

/** Canonical Public / Visitor profile route — same param as Public Sky. */
export function buildVisitorProfileHref(ownerId: string): string {
  return `/visitor-profile?id=${encodeURIComponent(ownerId)}`;
}

/** Paste into Chrome during `npm run web` (default port 8090). */
export function buildVisitorProfileWebUrl(
  ownerId: string = VISITOR_PROFILE_QA_OWNER_ID,
  port = 8090,
): string {
  return `http://localhost:${port}/visitor-profile?id=${encodeURIComponent(ownerId)}`;
}
