import type { GrowingInPillIconType } from '@/components/home/HomeGrowingInPillIcon';

import {
  SKY_AREA_CATEGORIES,
  type SkyAreaCategoryId,
  getSkyAreaCategory,
  isSkyAreaCategoryId,
} from '@/skyAreas/skyAreaCategory';

export type SkyAreaSource = 'default' | 'custom';

/** Canonical Sky Area — defaults from SKY_AREA_CATEGORIES plus user-created areas. */
export interface SkyArea {
  id: string;
  label: string;
  icon: GrowingInPillIconType;
  source: SkyAreaSource;
  createdByUser: boolean;
  sortOrder: number;
  active: boolean;
  createdAt: number;
}

export function defaultSkyAreaFromCategory(id: SkyAreaCategoryId): SkyArea {
  const category = getSkyAreaCategory(id);
  return {
    id: category.id,
    label: category.label,
    icon: category.pillIcon,
    source: 'default',
    createdByUser: false,
    sortOrder: category.sortOrder,
    active: true,
    createdAt: 0,
  };
}

export const DEFAULT_SKY_AREAS: readonly SkyArea[] = SKY_AREA_CATEGORIES.map((entry) =>
  defaultSkyAreaFromCategory(entry.id),
);

export function buildCustomSkyArea(label: string, now = Date.now()): SkyArea {
  const trimmed = label.trim();
  const slug = trimmed
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 48);
  const id = `custom-${slug || 'area'}-${now}`;
  return {
    id,
    label: trimmed,
    icon: 'community',
    source: 'custom',
    createdByUser: true,
    sortOrder: 900 + (now % 1000),
    active: true,
    createdAt: now,
  };
}

export function mergeSkyAreaCatalog(
  customAreas: readonly SkyArea[],
): SkyArea[] {
  const activeCustom = customAreas.filter((area) => area.active && area.source === 'custom');
  return [...DEFAULT_SKY_AREAS, ...activeCustom].sort((a, b) => a.sortOrder - b.sortOrder);
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
