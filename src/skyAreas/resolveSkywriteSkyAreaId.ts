import { isSkyAreaCategoryId } from '@/skyAreas/skyAreaCategory';
import type { SkywriteRecord } from '@/skywrite/types';

const FALLBACK_DEFAULT = 'growth' as const;

/**
 * Primary Sky Area is explicit user choice only.
 * Hashtags, text, and AI must NOT infer or override this field.
 */
export function resolveSkywriteSkyAreaId(record: SkywriteRecord): string {
  if (record.skyAreaId && record.skyAreaId.length > 0) {
    return record.skyAreaId;
  }
  return FALLBACK_DEFAULT;
}

export function isKnownSkyAreaId(value: string): boolean {
  return isSkyAreaCategoryId(value) || value.startsWith('custom-');
}
