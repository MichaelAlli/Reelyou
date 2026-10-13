import {
  parseQaSkyLandingMode,
  QA_SKY_LANDING_QUERY,
} from '@/qa/qaPreviewLandingParams';

/** Query param for deep links that must open personal My Sky (not Explore). */
export const MY_SKY_PERSONAL_QUERY = 'personal';

export function mySkyPersonalTabHref(): string {
  return `/(tabs)/sky?${MY_SKY_PERSONAL_QUERY}=1`;
}

export function isMySkyPersonalLandingParam(value: string | string[] | undefined): boolean {
  const raw = Array.isArray(value) ? value[0] : value;
  return raw === '1' || raw === 'true';
}

/** Resolve Explore vs personal from URL (production deep links + QA gallery landing). */
export function resolveMySkyExploreLandingFromParams(
  params: Record<string, string | string[] | undefined>,
  options?: { qaPreviewActive?: boolean },
): 'explore' | 'personal' | null {
  if (isMySkyPersonalLandingParam(params[MY_SKY_PERSONAL_QUERY])) {
    return 'personal';
  }
  const qaMode = parseQaSkyLandingMode(params[QA_SKY_LANDING_QUERY]);
  if (qaMode === 'personal') return 'personal';
  if (qaMode === 'explore') return 'explore';
  if (options?.qaPreviewActive && qaMode === null) {
    return null;
  }
  return null;
}
