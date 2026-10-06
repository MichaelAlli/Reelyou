import { getCanonicalProfilePhotoDisplayUri } from '@/identity/canonicalUserProfilePhoto';
import type { SkywriteRecord } from '@/skywrite/types';

import { buildProfileSkywritingsSection } from '@/profile/buildProfileSkywritingsSection';
import type { OwnerProfileMetrics, OwnerProfileView } from '@/profile/ownerProfileTypes';
import { filterProfileSkywritingItems } from '@/profile/buildProfileSkywritingsSection';
import { SKY_AREA_TAB_ALL, type SkyAreaCategoryId } from '@/skyAreas/skyAreaCategory';

function formatOwnerBio(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return '';
  return trimmed.startsWith('“') ? trimmed : `“${trimmed.replace(/^"|"$/g, '')}”`;
}

function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function buildOwnerProfileView(input: {
  owner: {
    id: string;
    name: string;
    roleLine?: string;
    bio?: string;
    avatarInitials?: string;
    avatarColor?: string;
  };
  skywrites: SkywriteRecord[];
  profileSkyAreaShortcutIds?: readonly SkyAreaCategoryId[];
  avatarUriOverride?: string | null;
  metrics?: OwnerProfileMetrics;
}): OwnerProfileView {
  const roleLine = input.owner.roleLine?.trim() ?? '';
  const bio = formatOwnerBio(input.owner.bio ?? '');

  const shortcutIds =
    input.profileSkyAreaShortcutIds && input.profileSkyAreaShortcutIds.length > 0
      ? input.profileSkyAreaShortcutIds
      : [];

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
      id: input.owner.id,
      name: input.owner.name,
      roleLine,
      bio,
      avatarUri:
        input.avatarUriOverride ??
        getCanonicalProfilePhotoDisplayUri() ??
        null,
      avatarInitials: input.owner.avatarInitials ?? initialsFromName(input.owner.name),
      avatarColor: input.owner.avatarColor ?? '#6B7FD7',
    },
    metrics: {
      livesImpacted: input.metrics?.livesImpacted ?? 0,
      contributionsMade: input.metrics?.contributionsMade ?? 0,
    },
    skywritingPreviews,
    skywritings,
  };
}
