import {
  isSkyAreaCategoryId,
  resolveSkyAreaIdFromTag,
  type SkyAreaCategoryId,
} from '@/skyAreas/skyAreaCategory';
import type { SkywriteRecord } from '@/skywrite/types';

/** Resolve canonical sky area for a Skywrite — explicit id wins, then hashtags/text. */
export function resolveSkywriteSkyAreaId(record: SkywriteRecord): SkyAreaCategoryId {
  if (record.skyAreaId && isSkyAreaCategoryId(record.skyAreaId)) {
    return record.skyAreaId;
  }

  for (const tag of record.userHashtags) {
    const mapped = resolveSkyAreaIdFromTag(tag);
    if (mapped) return mapped;
  }

  const words = record.text.toLowerCase();
  const keywordOrder: SkyAreaCategoryId[] = [
    'growth',
    'purpose',
    'creativity',
    'career',
    'entrepreneurship',
    'health',
    'faith-meaning',
    'learning',
    'contribution',
    'community',
    'relationships',
  ];

  for (const id of keywordOrder) {
    const label = id.replace('-', ' ');
    if (words.includes(label) || words.includes(id)) return id;
  }

  if (record.showingUp === 'question') return 'purpose';
  if (record.showingUp === 'reflection') return 'growth';

  return 'growth';
}
