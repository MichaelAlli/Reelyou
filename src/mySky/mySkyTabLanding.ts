/** Query param for deep links that must open personal My Sky (not Explore). */
export const MY_SKY_PERSONAL_QUERY = 'personal';

export function mySkyPersonalTabHref(): string {
  return `/(tabs)/sky?${MY_SKY_PERSONAL_QUERY}=1`;
}

export function isMySkyPersonalLandingParam(value: string | string[] | undefined): boolean {
  const raw = Array.isArray(value) ? value[0] : value;
  return raw === '1' || raw === 'true';
}
