import type { SkywriteRecord } from '@/skywrite/types';
import type { Privacy } from '@/types';

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

/** Visitor-safe Skywrites — public only; orbit when viewer is connected. */
export function filterVisitorVisibleSkywrites(
  skywrites: SkywriteRecord[],
  isConnected: boolean,
): SkywriteRecord[] {
  return skywrites.filter((entry) => {
    if (entry.visibility === 'public') return true;
    if (entry.visibility === 'orbit' && isConnected) return true;
    return false;
  });
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
  isConnected: boolean,
): boolean {
  if (skyVisibility === 'public') return true;
  if (skyVisibility === 'orbit' && isConnected) return true;
  return false;
}
