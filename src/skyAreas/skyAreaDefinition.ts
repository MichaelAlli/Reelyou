import type { GrowingInPillIconType } from '@/components/home/HomeGrowingInPillIcon';

import {
  SKY_AREA_CATEGORIES,
  type SkyAreaCategoryId,
  getSkyAreaCategory,
  isSkyAreaCategoryId,
} from '@/skyAreas/skyAreaCategory';
import {
  normalizeSkyAreaLabel,
  skyAreaSlugFromLabel,
} from '@/skyAreas/skyAreaNormalization';

export type SkyAreaSource = 'default' | 'custom';

export type SkyAreaModerationStatus = 'active' | 'pending' | 'hidden' | 'merged' | 'blocked';

/** Canonical Sky Area — defaults from SKY_AREA_CATEGORIES plus user-created areas. */
export interface SkyArea {
  id: string;
  label: string;
  normalizedLabel: string;
  slug: string;
  icon: GrowingInPillIconType;
  source: SkyAreaSource;
  createdByUser: boolean;
  createdByUserId?: string;
  aliases?: string[];
  parentAreaId?: string;
  moderationStatus?: SkyAreaModerationStatus;
  sortOrder: number;
  active: boolean;
  createdAt: number;
  updatedAt: number;
}

export type SkyAreaId = string;

export function defaultSkyAreaFromCategory(id: SkyAreaCategoryId): SkyArea {
  const category = getSkyAreaCategory(id);
  return {
    id: category.id,
    label: category.label,
    normalizedLabel: normalizeSkyAreaLabel(category.label),
    slug: category.id,
    icon: category.pillIcon,
    source: 'default',
    createdByUser: false,
    moderationStatus: 'active',
    sortOrder: category.sortOrder,
    active: true,
    createdAt: 0,
    updatedAt: 0,
  };
}

export const DEFAULT_SKY_AREAS: readonly SkyArea[] = SKY_AREA_CATEGORIES.map((entry) =>
  defaultSkyAreaFromCategory(entry.id),
);

export function buildCustomSkyArea(
  label: string,
  options?: { now?: number; createdByUserId?: string; existingId?: string },
): SkyArea {
  const now = options?.now ?? Date.now();
  const trimmed = label.trim();
  const slug = skyAreaSlugFromLabel(trimmed);
  const id = options?.existingId ?? `custom-${slug || 'area'}-${now}`;
  return {
    id,
    label: trimmed,
    normalizedLabel: normalizeSkyAreaLabel(trimmed),
    slug,
    icon: 'community',
    source: 'custom',
    createdByUser: true,
    createdByUserId: options?.createdByUserId,
    moderationStatus: 'active',
    sortOrder: 900 + (now % 1000),
    active: true,
    createdAt: now,
    updatedAt: now,
  };
}

export function mergeSkyAreaCatalog(
  customAreas: readonly SkyArea[],
  sharedAreas: readonly SkyArea[] = [],
): SkyArea[] {
  const byId = new Map<string, SkyArea>();
  for (const area of DEFAULT_SKY_AREAS) {
    byId.set(area.id, area);
  }
  for (const area of sharedAreas) {
    if (area.active && area.source === 'custom') byId.set(area.id, area);
  }
  for (const area of customAreas) {
    if (area.active && area.source === 'custom') byId.set(area.id, area);
  }
  return [...byId.values()].sort((a, b) => a.sortOrder - b.sortOrder);
}

export function findAreaByNormalizedLabel(
  catalog: readonly SkyArea[],
  label: string,
): SkyArea | undefined {
  const norm = normalizeSkyAreaLabel(label);
  return catalog.find((area) => area.normalizedLabel === norm);
}

export function resolveSkyAreaLabel(
  areaId: string,
  customAreas: readonly SkyArea[],
): string | null {
  if (isSkyAreaCategoryId(areaId)) {
    return getSkyAreaCategory(areaId).label;
  }
  const custom = customAreas.find((entry) => entry.id === areaId);
  return custom?.label ?? null;
}
