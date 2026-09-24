import {
  getSkyAreaCategory,
  isSkyAreaCategoryId,
  PROFILE_BETA_PREVIEW_CATEGORY_IDS,
  SKY_AREA_TAB_ALL,
  type SkyAreaTabId,
} from '@/skyAreas/skyAreaCategory';
import { resolveSkywriteSkyAreaId } from '@/skyAreas/resolveSkywriteSkyAreaId';
import type { SkywriteRecord } from '@/skywrite/types';

import { filterVisitorVisibleSkywrites } from '@/profile/buildSkywritingPreviews';
import type { SkyFollowGraph } from '@/social/skyFollow/skyFollowTypes';
import { buildVisitorSkywritingTabsFromVisibleItems } from '@/profile/resolveVisitorProfilePrivacy';
import type { OwnerProfileSkywritingPreview } from '@/profile/ownerProfileTypes';

export type ProfileSkywritingTone = OwnerProfileSkywritingPreview['tone'];

/** Beta profile UI — All + placeholder categories (future: derive from user areas + visibility). */
export function buildProfileBetaSkywritingTabs(): ProfileSkywritingTab[] {
  return [
    { id: SKY_AREA_TAB_ALL, label: 'All' },
    ...PROFILE_BETA_PREVIEW_CATEGORY_IDS.map((id) => ({
      id,
      label: getSkyAreaCategory(id).label,
    })),
  ];
}

export interface ProfileSkywritingItem {
  id: string;
  label: string;
  skyAreaId: string;
  tone: ProfileSkywritingTone;
}

export interface ProfileSkywritingTab {
  id: SkyAreaTabId;
  label: string;
}

export interface ProfileSkywritingsSection {
  tabs: ProfileSkywritingTab[];
  items: ProfileSkywritingItem[];
  viewerMode: 'owner' | 'visitor';
}

function toneForArea(areaId: string): ProfileSkywritingTone {
  if (!isSkyAreaCategoryId(areaId)) return 'leaf';
  switch (areaId) {
    case 'career':
    case 'learning':
    case 'contribution':
      return 'briefcase';
    case 'creativity':
      return 'creative';
    case 'community':
    case 'relationships':
    case 'purpose':
    case 'faith-meaning':
      return 'community';
    default:
      return 'leaf';
  }
}

function recordToItem(record: SkywriteRecord): ProfileSkywritingItem {
  const skyAreaId = resolveSkywriteSkyAreaId(record);
  return {
    id: record.id,
    label: record.text?.slice(0, 28).trim() || 'Reflection',
    skyAreaId,
    tone: toneForArea(skyAreaId),
  };
}

export function buildProfileSkywritingsSection(input: {
  skywrites: SkywriteRecord[];
  viewerMode: 'owner' | 'visitor';
  visitorAccess?: {
    viewerId: string;
    authorId: string;
    followGraph: SkyFollowGraph;
    blockedUserIds: readonly string[];
  };
}): ProfileSkywritingsSection {
  const eligible =
    input.viewerMode === 'owner'
      ? input.skywrites
      : input.visitorAccess
        ? filterVisitorVisibleSkywrites(input.skywrites, input.visitorAccess)
        : [];

  const items = eligible.map(recordToItem);
  const tabs =
    input.viewerMode === 'visitor'
      ? buildVisitorSkywritingTabsFromVisibleItems(items)
      : buildProfileBetaSkywritingTabs();

  return {
    tabs,
    items,
    viewerMode: input.viewerMode,
  };
}

export function filterProfileSkywritingItems(
  items: ProfileSkywritingItem[],
  tabId: SkyAreaTabId,
): ProfileSkywritingItem[] {
  if (tabId === SKY_AREA_TAB_ALL) return items;
  return items.filter((item) => item.skyAreaId === tabId);
}
