import { orbitUsers } from '@/data/mockData';
import { stableSlotIndexForId } from '@/mySky/skyLayout';
import { resolvePublicSkyOwnerProfile } from '@/mySky/skyIdentity';
import {
  canViewPublicSky,
  resolveSkyVisibilitySettingsForOwner,
  type SkyVisibilitySettings,
} from '@/mySky/skyVisibilitySettings';
import type { SkywriteRecord } from '@/skywrite/types';

import {
  buildProfileSkywritingsSection,
  filterProfileSkywritingItems,
} from '@/profile/buildProfileSkywritingsSection';
import { visitorCanShowImpactMetrics } from '@/profile/buildSkywritingPreviews';
import { isMutualSkyFriends } from '@/social/skyFollow/skyFollowLogic';
import type { SkyFollowGraph } from '@/social/skyFollow/skyFollowTypes';
import { resolveOrbitOwnerSkywrites } from '@/profile/orbitProfileSkywriteFixtures';
import type { OwnerProfileMetrics, OwnerProfileView } from '@/profile/ownerProfileTypes';
import type { SkyConnectionStatus } from '@/mySky/skyIdentity';
import { SKY_AREA_TAB_ALL } from '@/skyAreas/skyAreaCategory';

export interface VisitorProfileView extends OwnerProfileView {
  ownerId: string;
  connectionStatus: SkyConnectionStatus;
  skyVisibility: SkyVisibilitySettings;
  showSkyPreview: boolean;
  showImpactMetrics: boolean;
}

function publicMetricsForOwner(ownerId: string): OwnerProfileMetrics {
  const slot = stableSlotIndexForId(ownerId, 97);
  return {
    livesImpacted: 14 + (slot % 38),
    contributionsMade: 6 + (slot % 22),
  };
}

function formatBio(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return '';
  return trimmed.startsWith('“') ? trimmed : `“${trimmed.replace(/^"|"$/g, '')}”`;
}

export function buildVisitorProfileView(input: {
  ownerId: string;
  viewerId: string;
  connectionStatus: SkyConnectionStatus;
  followGraph: SkyFollowGraph;
  blockedUserIds: readonly string[];
  ownerSkywrites?: SkywriteRecord[];
}): VisitorProfileView | null {
  const ownerProfile = resolvePublicSkyOwnerProfile(input.ownerId, input.connectionStatus);
  if (!ownerProfile) return null;

  const orbitUser = orbitUsers.find((entry) => entry.id === input.ownerId);
  const visibility = resolveSkyVisibilitySettingsForOwner(input.ownerId);
  const isConnected = input.connectionStatus === 'connected';
  const isSkyFriend = isMutualSkyFriends(input.followGraph, input.viewerId, input.ownerId);
  const showSkyPreview = canViewPublicSky(visibility, isConnected);
  const showImpactMetrics = visitorCanShowImpactMetrics(visibility.skyVisibility, isSkyFriend);

  const sourceSkywrites =
    input.ownerSkywrites ?? resolveOrbitOwnerSkywrites(input.ownerId);

  const skywritings = buildProfileSkywritingsSection({
    skywrites: sourceSkywrites,
    viewerMode: 'visitor',
    visitorAccess: {
      viewerId: input.viewerId,
      authorId: input.ownerId,
      followGraph: input.followGraph,
      blockedUserIds: input.blockedUserIds,
    },
  });

  const skywritingPreviews = filterProfileSkywritingItems(
    skywritings.items,
    SKY_AREA_TAB_ALL,
  ).slice(0, 4);

  const roleLine =
    orbitUser?.label?.replace(/,/g, ' •') ||
    ownerProfile.subtitle?.replace(/,/g, ' •') ||
    'Friend • Growth';

  const bioSource =
    ownerProfile.bio ||
    (orbitUser ? `Walking a path of ${orbitUser.themes.join(' and ')}.` : '');

  return {
    ownerId: input.ownerId,
    connectionStatus: input.connectionStatus,
    skyVisibility: visibility,
    showSkyPreview,
    showImpactMetrics,
    identity: {
      id: ownerProfile.id,
      name: ownerProfile.name,
      roleLine,
      bio: formatBio(bioSource),
      avatarUri: ownerProfile.avatarUri ?? null,
      avatarInitials: ownerProfile.avatarInitials,
      avatarColor: ownerProfile.avatarColor,
    },
    metrics: showImpactMetrics
      ? publicMetricsForOwner(input.ownerId)
      : { livesImpacted: 0, contributionsMade: 0 },
    skywritingPreviews,
    skywritings,
  };
}
