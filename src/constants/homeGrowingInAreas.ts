import type { SkyAreaCategoryId } from '@/skyAreas/skyAreaCategory';

/** Home pill order — personal growth Sky Areas (not communities). */
export const HOME_GROWING_IN_AREAS: ReadonlyArray<{
  label: string;
  skyAreaId: SkyAreaCategoryId;
}> = [
  { label: 'Entrepreneurship', skyAreaId: 'entrepreneurship' },
  { label: 'Personal Growth', skyAreaId: 'growth' },
  { label: 'Creativity', skyAreaId: 'creativity' },
  { label: 'Purpose Seekers', skyAreaId: 'purpose' },
] as const;
