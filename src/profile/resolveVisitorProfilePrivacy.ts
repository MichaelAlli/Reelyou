import {
  getSkyAreaCategory,
  PROFILE_BETA_PREVIEW_CATEGORY_IDS,
  SKY_AREA_TAB_ALL,
  type SkyAreaCategoryId,
} from '@/skyAreas/skyAreaCategory';

import type { ProfileSkywritingItem, ProfileSkywritingTab } from '@/profile/buildProfileSkywritingsSection';

/** Block list is canonical for DM + profile access in beta. */
export function isVisitorProfileBlocked(
  ownerId: string,
  blockedUserIds: string[],
): boolean {
  return blockedUserIds.includes(ownerId);
}

/**
 * Visitor Skywriting tabs — privacy first.
 * Only categories with visitor-visible items appear (within beta preview ids).
 */
export function buildVisitorSkywritingTabsFromVisibleItems(
  visibleItems: ProfileSkywritingItem[],
): ProfileSkywritingTab[] {
  const visibleCategories = new Set<SkyAreaCategoryId>(
    visibleItems.map((item) => item.skyAreaId),
  );

  const categoryTabs = PROFILE_BETA_PREVIEW_CATEGORY_IDS.filter((id) =>
    visibleCategories.has(id),
  ).map((id) => ({
    id,
    label: getSkyAreaCategory(id).label,
  }));

  return [{ id: SKY_AREA_TAB_ALL, label: 'All' }, ...categoryTabs];
}
