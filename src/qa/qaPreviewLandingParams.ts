/**
 * QA Gallery landing parameters — single source for initial preview state.
 * Catalog hrefs in qaPreviewRoutes.ts must use these builders (not ad-hoc query strings).
 */

export const QA_SKY_LANDING_QUERY = 'qaSkyLanding';

export type QaSkyLandingMode = 'explore' | 'personal';

export function buildMySkyPreviewHref(mode: QaSkyLandingMode): string {
  if (mode === 'personal') {
    return '/sky?personal=1';
  }
  return `/sky?${QA_SKY_LANDING_QUERY}=explore`;
}

export function parseQaSkyLandingMode(
  value: string | string[] | undefined,
): QaSkyLandingMode | null {
  const raw = Array.isArray(value) ? value[0] : value;
  if (raw === 'explore') return 'explore';
  if (raw === 'personal') return 'personal';
  return null;
}

/** Required initial My Sky explore state when opening a catalog target (QA preview only). */
export function expectedMySkyExploreEnabledForTarget(targetId: string): boolean | null {
  switch (targetId) {
    case 'my-sky':
    case 'my-sky-explore':
      return true;
    case 'my-sky-personal':
      return false;
    default:
      return null;
  }
}
