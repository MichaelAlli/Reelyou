import { currentUser, impactMetrics, profileStats, skywriteTags } from '@/data/mockData';
import type { SkywriteRecord } from '@/skywrite/types';

import type {
  OwnerProfileSkywritingPreview,
  OwnerProfileView,
} from '@/profile/ownerProfileTypes';

const PREVIEW_TONES: OwnerProfileSkywritingPreview['tone'][] = [
  'briefcase',
  'leaf',
  'creative',
  'community',
];

function buildSkywritingPreviews(
  skywrites: SkywriteRecord[],
  tags: string[],
): OwnerProfileSkywritingPreview[] {
  const fromPosts = skywrites.slice(0, 4).map((entry, index) => ({
    id: entry.id,
    label: entry.text?.slice(0, 28).trim() || 'Reflection',
    tone: PREVIEW_TONES[index % PREVIEW_TONES.length],
  }));

  if (fromPosts.length >= 3) return fromPosts;

  return tags.slice(0, 4).map((label, index) => ({
    id: `tag-${label}`,
    label,
    tone: PREVIEW_TONES[index % PREVIEW_TONES.length],
  }));
}

export function buildOwnerProfileView(input: {
  skywrites: SkywriteRecord[];
  roleLineOverride?: string;
  bioOverride?: string;
}): OwnerProfileView {
  const roleLine =
    input.roleLineOverride?.trim() ||
    currentUser.subtitle?.replace(/,/g, ' •') ||
    'Entrepreneur • Creator • Builder';

  const bio =
    input.bioOverride?.trim() ||
    currentUser.bio ||
    'I’m building businesses and communities that help people become their best selves.';

  return {
    identity: {
      id: currentUser.id,
      name: currentUser.name,
      roleLine,
      bio: bio.startsWith('“') ? bio : `“${bio.replace(/^"|"$/g, '')}”`,
      avatarUri: currentUser.avatarUri ?? null,
      avatarInitials: currentUser.avatarInitials,
      avatarColor: currentUser.avatarColor,
    },
    metrics: {
      livesImpacted: profileStats.livesEncouraged ?? impactMetrics.livesEncouraged,
      contributionsMade: profileStats.contributionsMade ?? impactMetrics.contributionsMade,
    },
    skywritingPreviews: buildSkywritingPreviews(input.skywrites, skywriteTags),
  };
}
