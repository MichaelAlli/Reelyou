import { currentUser, impactMetrics, profileStats } from '@/data/mockData';
import type { SkywriteRecord } from '@/skywrite/types';

import { buildProfileSkywritingsSection } from '@/profile/buildProfileSkywritingsSection';
import type { OwnerProfileView } from '@/profile/ownerProfileTypes';
import { filterProfileSkywritingItems } from '@/profile/buildProfileSkywritingsSection';
import { SKY_AREA_TAB_ALL } from '@/skyAreas/skyAreaCategory';

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

  const skywritings = buildProfileSkywritingsSection({
    skywrites: input.skywrites,
    viewerMode: 'owner',
  });

  const skywritingPreviews = filterProfileSkywritingItems(
    skywritings.items,
    SKY_AREA_TAB_ALL,
  ).slice(0, 4);

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
    skywritingPreviews,
    skywritings,
  };
}
