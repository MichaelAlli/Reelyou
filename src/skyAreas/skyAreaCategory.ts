import type { GrowingInPillIconType } from '@/components/home/HomeGrowingInPillIcon';

/** Stable ids — shared by Skywrite, profile filters, Where You Live in the Sky, beacons. */
export type SkyAreaCategoryId =
  | 'growth'
  | 'purpose'
  | 'relationships'
  | 'career'
  | 'entrepreneurship'
  | 'creativity'
  | 'health'
  | 'faith-meaning'
  | 'learning'
  | 'contribution'
  | 'community';

export const SKY_AREA_TAB_ALL = 'all' as const;
export type SkyAreaTabId = typeof SKY_AREA_TAB_ALL | SkyAreaCategoryId;

/**
 * Beta profile preview tabs only — not the full product category set.
 * Full taxonomy remains in SKY_AREA_CATEGORIES for composer / custom areas later.
 */
export const PROFILE_BETA_PREVIEW_CATEGORY_IDS: readonly SkyAreaCategoryId[] = [
  'growth',
  'purpose',
  'creativity',
] as const;

export interface SkyAreaCategory {
  id: SkyAreaCategoryId;
  label: string;
  pillIcon: GrowingInPillIconType;
  sortOrder: number;
}

export const SKY_AREA_CATEGORIES: readonly SkyAreaCategory[] = [
  { id: 'growth', label: 'Growth', pillIcon: 'leaf', sortOrder: 10 },
  { id: 'purpose', label: 'Purpose', pillIcon: 'community', sortOrder: 20 },
  { id: 'relationships', label: 'Relationships', pillIcon: 'community', sortOrder: 30 },
  { id: 'career', label: 'Career', pillIcon: 'briefcase', sortOrder: 40 },
  {
    id: 'entrepreneurship',
    label: 'Entrepreneurship',
    pillIcon: 'briefcase',
    sortOrder: 45,
  },
  { id: 'creativity', label: 'Creativity', pillIcon: 'creative', sortOrder: 50 },
  { id: 'health', label: 'Health', pillIcon: 'leaf', sortOrder: 60 },
  { id: 'faith-meaning', label: 'Faith / Meaning', pillIcon: 'community', sortOrder: 70 },
  { id: 'learning', label: 'Learning', pillIcon: 'briefcase', sortOrder: 80 },
  { id: 'contribution', label: 'Contribution', pillIcon: 'briefcase', sortOrder: 90 },
  { id: 'community', label: 'Community', pillIcon: 'community', sortOrder: 100 },
] as const;

const BY_ID = new Map(SKY_AREA_CATEGORIES.map((entry) => [entry.id, entry]));

export function getSkyAreaCategory(id: SkyAreaCategoryId): SkyAreaCategory {
  const found = BY_ID.get(id);
  if (!found) return SKY_AREA_CATEGORIES[0];
  return found;
}

export function isSkyAreaCategoryId(value: unknown): value is SkyAreaCategoryId {
  return typeof value === 'string' && BY_ID.has(value as SkyAreaCategoryId);
}

/** Maps legacy theme/tag strings to canonical ids. */
const TAG_TO_AREA: Record<string, SkyAreaCategoryId> = {
  growth: 'growth',
  purpose: 'purpose',
  relationships: 'relationships',
  relationship: 'relationships',
  career: 'career',
  entrepreneurship: 'entrepreneurship',
  creativity: 'creativity',
  creative: 'creativity',
  health: 'health',
  healing: 'health',
  faith: 'faith-meaning',
  meaning: 'faith-meaning',
  learning: 'learning',
  contribution: 'contribution',
  community: 'community',
  'personal growth': 'growth',
  'faith / meaning': 'faith-meaning',
};

export function resolveSkyAreaIdFromTag(tag: string): SkyAreaCategoryId | null {
  const key = tag.trim().toLowerCase();
  return TAG_TO_AREA[key] ?? null;
}
