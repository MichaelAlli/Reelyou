import {
  getSkyAreaCategory,
  isSkyAreaCategoryId,
  PROFILE_BETA_PREVIEW_CATEGORY_IDS,
  SKY_AREA_TAB_ALL,
  type SkyAreaCategoryId,
  type SkyAreaTabId,
} from '@/skyAreas/skyAreaCategory';
import type { SkywriteRecord } from '@/skywrite/types';

import { isModerationContentSuppressedSync } from '@/moderation/moderationContentRegistry';
import { filterVisitorVisibleSkywrites } from '@/profile/buildSkywritingPreviews';
import type { SkyFollowGraph } from '@/social/skyFollow/skyFollowTypes';
import { buildVisitorSkywritingTabsFromVisibleItems } from '@/profile/resolveVisitorProfilePrivacy';
import type { OwnerProfileSkywritingPreview } from '@/profile/ownerProfileTypes';

export type ProfileSkywritingTone = OwnerProfileSkywritingPreview['tone'];

/** Owner profile — All plus three user-chosen Sky area shortcuts. */
export function buildOwnerProfileSkywritingTabs(
  shortcutIds: readonly SkyAreaCategoryId[] = [],
): ProfileSkywritingTab[] {
  return [
    { id: SKY_AREA_TAB_ALL, label: 'All' },
    ...shortcutIds.map((id) => ({
      id,
      label: getSkyAreaCategory(id).label,
    })),
  ];
}

/** @deprecated Use buildOwnerProfileSkywritingTabs — kept for tests. */
export function buildProfileBetaSkywritingTabs(): ProfileSkywritingTab[] {
  return buildOwnerProfileSkywritingTabs();
}

export interface ProfileSkywritingItem {
  id: string;
  label: string;
  /** Explicit composer area only — null when unset (visible under All only). */
  skyAreaId: string | null;
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
  const skyAreaId =
    record.skyAreaId && record.skyAreaId.length > 0 ? record.skyAreaId : null;
  return {
    id: record.id,
    label: record.text?.slice(0, 28).trim() || 'Reflection',
    skyAreaId,
    tone: skyAreaId ? toneForArea(skyAreaId) : 'leaf',
  };
}

export function buildProfileSkywritingsSection(input: {
  skywrites: SkywriteRecord[];
  viewerMode: 'owner' | 'visitor';
  ownerShortcutIds?: readonly SkyAreaCategoryId[];
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

  const items = eligible
    .filter((record) => !isModerationContentSuppressedSync('skywrite', record.id))
    .map(recordToItem);
  const tabs =
    input.viewerMode === 'visitor'
      ? buildVisitorSkywritingTabsFromVisibleItems(items)
      : buildOwnerProfileSkywritingTabs(input.ownerShortcutIds);

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
  return items.filter((item) => item.skyAreaId != null && item.skyAreaId === tabId);
}
