import type { SkyFollowGraph } from '@/social/skyFollow/skyFollowTypes';
import { resolveSkywriteViewerAccess } from '@/skywrite/access/resolveSkywriteViewerAccess';
import type { SkywriteRecord } from '@/skywrite/types';
import type { Privacy } from '@/types';
import { normalizeSkywriteVisibility } from '@/skywrite/skywriteVisibility';

import type { OwnerProfileSkywritingPreview } from '@/profile/ownerProfileTypes';

const PREVIEW_TONES: OwnerProfileSkywritingPreview['tone'][] = [
  'briefcase',
  'leaf',
  'creative',
  'community',
];

export function buildSkywritingPreviewsFromRecords(
  skywrites: SkywriteRecord[],
  fallbackTags: string[],
): OwnerProfileSkywritingPreview[] {
  const fromPosts = skywrites.slice(0, 4).map((entry, index) => ({
    id: entry.id,
    label: entry.text?.slice(0, 28).trim() || 'Reflection',
    tone: PREVIEW_TONES[index % PREVIEW_TONES.length],
  }));

  if (fromPosts.length >= 3) return fromPosts;

  return fallbackTags.slice(0, 4).map((label, index) => ({
    id: `tag-${label}`,
    label,
    tone: PREVIEW_TONES[index % PREVIEW_TONES.length],
  }));
}

/** Visitor-safe Skywrites — enforced via mutual Sky Friends, not one-way follow. */
export function filterVisitorVisibleSkywrites(
  skywrites: SkywriteRecord[],
  input: {
    viewerId: string;
    authorId: string;
    followGraph: SkyFollowGraph;
    blockedUserIds: readonly string[];
  },
): SkywriteRecord[] {
  return skywrites.filter((entry) =>
    resolveSkywriteViewerAccess({
      viewerId: input.viewerId,
      authorId: input.authorId,
      visibility: entry.visibility,
      followGraph: input.followGraph,
      blockedUserIds: input.blockedUserIds,
    }),
  );
}

export function buildVisitorSkywritingPreviews(
  publicThemes: string[],
  visibleSkywrites: SkywriteRecord[],
): OwnerProfileSkywritingPreview[] {
  const previews = buildSkywritingPreviewsFromRecords(visibleSkywrites, publicThemes);
  return previews.slice(0, 4);
}

export function visitorCanShowImpactMetrics(
  skyVisibility: Privacy,
  isSkyFriend: boolean,
): boolean {
  const level = normalizeSkywriteVisibility(skyVisibility);
  if (level === 'public') return true;
  if (level === 'sky_friends' && isSkyFriend) return true;
  return false;
}
