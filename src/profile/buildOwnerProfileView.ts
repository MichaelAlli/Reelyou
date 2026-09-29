import { currentUser, impactMetrics, profileStats } from '@/data/mockData';
import { getCanonicalProfilePhotoDisplayUri } from '@/identity/canonicalUserProfilePhoto';
import type { SkywriteRecord } from '@/skywrite/types';

import { buildProfileSkywritingsSection } from '@/profile/buildProfileSkywritingsSection';
import type { OwnerProfileView } from '@/profile/ownerProfileTypes';
import { filterProfileSkywritingItems } from '@/profile/buildProfileSkywritingsSection';
import { PROFILE_BETA_PREVIEW_CATEGORY_IDS, SKY_AREA_TAB_ALL, type SkyAreaCategoryId } from '@/skyAreas/skyAreaCategory';

export function buildOwnerProfileView(input: {
  skywrites: SkywriteRecord[];
  profileSkyAreaShortcutIds?: readonly SkyAreaCategoryId[];
  roleLineOverride?: string;
  bioOverride?: string;
  avatarUriOverride?: string | null;
}): OwnerProfileView {
  const roleLine =
    input.roleLineOverride?.trim() ||
    currentUser.subtitle?.replace(/,/g, ' •') ||
    'Entrepreneur • Creator • Builder';

  const bio =
    input.bioOverride?.trim() ||
    currentUser.bio ||
    'I’m building businesses and communities that help people become their best selves.';

  const shortcutIds =
    input.profileSkyAreaShortcutIds && input.profileSkyAreaShortcutIds.length > 0
      ? input.profileSkyAreaShortcutIds
      : PROFILE_BETA_PREVIEW_CATEGORY_IDS;

  const skywritings = buildProfileSkywritingsSection({
    skywrites: input.skywrites,
    viewerMode: 'owner',
    ownerShortcutIds: shortcutIds,
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
      avatarUri:
        input.avatarUriOverride ??
        getCanonicalProfilePhotoDisplayUri() ??
        currentUser.avatarUri ??
        null,
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
