import { isExplicitDevDemoModeEnabled } from '@/auth/demoMode';
import { currentUser, orbitUsers } from '@/data/mockData';
import { resolveExploreDemoOwnerProfile } from '@/explore/exploreDemoSkies';
import {
  isDemoVisitorMutualProfileOwner,
  resolveDemoVisitorMutualProfile,
  resolveDevOnlyOrbitProfile,
} from '@/profile/profileMutualConnectionsDemo';
import { getCanonicalProfilePhotoDisplayUri } from '@/identity/canonicalUserProfilePhoto';
import { stableSlotIndexForId } from '@/mySky/skyLayout';
import type { SkyNodePosition } from '@/mySky/skyNodeTypes';

export const SKY_IDENTITY_NODE_PREFIX = 'sky-identity';

export type SkyConnectionStatus = 'connected' | 'none';

export interface SkyOwnerProfile {
  id: string;
  name: string;
  subtitle?: string;
  bio?: string;
  avatarInitials: string;
  avatarColor: string;
  avatarUri?: string | null;
  northStarSummary?: string;
  isSelf: boolean;
  connectionStatus?: SkyConnectionStatus;
}

/** Stable identity node id — one per sky owner. */
export function buildSkyIdentityNodeId(ownerId: string): string {
  return `${SKY_IDENTITY_NODE_PREFIX}-${ownerId}`;
}

export function isSkyIdentityNodeId(nodeId: string): boolean {
  return nodeId.startsWith(`${SKY_IDENTITY_NODE_PREFIX}-`);
}

/**
 * Intentional anchor position — slightly off-center, stable per owner.
 * Moves with the unified Sky world during pan/zoom.
 */
export function resolveSkyIdentityPosition(ownerId: string): SkyNodePosition & { color: string } {
  const slot = stableSlotIndexForId(ownerId, 24);
  const angle = (slot / 24) * Math.PI * 2;
  const baseX = 0.38;
  const baseY = 0.52;
  const dx = Math.cos(angle) * 0.055;
  const dy = Math.sin(angle) * 0.045;

  return {
    x: baseX + dx,
    y: baseY + dy,
    color: '#FFD57A',
  };
}

export function resolveCurrentSkyOwnerProfile(
  northStarVision: string,
  sessionOwner?: { id: string; fullName?: string | null } | null,
): SkyOwnerProfile {
  const northStarSummary = northStarVision.trim() || undefined;
  if (sessionOwner?.id) {
    const name = sessionOwner.fullName?.trim() || 'You';
    const initials =
      name
        .split(/\s+/)
        .map((part) => part[0])
        .join('')
        .slice(0, 2)
        .toUpperCase() || 'YO';
    return {
      id: sessionOwner.id,
      name,
      avatarInitials: initials,
      avatarColor: '#FFD57A',
      avatarUri: getCanonicalProfilePhotoDisplayUri(),
      northStarSummary,
      isSelf: true,
    };
  }
  if (isExplicitDevDemoModeEnabled()) {
    return {
      id: currentUser.id,
      name: currentUser.name,
      subtitle: currentUser.subtitle,
      bio: currentUser.bio,
      avatarInitials: currentUser.avatarInitials,
      avatarColor: currentUser.avatarColor,
      avatarUri: getCanonicalProfilePhotoDisplayUri(),
      northStarSummary,
      isSelf: true,
    };
  }
  return {
    id: '',
    name: 'You',
    avatarInitials: 'YO',
    avatarColor: '#FFD57A',
    avatarUri: getCanonicalProfilePhotoDisplayUri(),
    northStarSummary,
    isSelf: true,
  };
}

export function resolvePublicSkyOwnerProfile(
  userId: string,
  connectionStatus: SkyConnectionStatus = 'none',
): SkyOwnerProfile | null {
  if (isExplicitDevDemoModeEnabled() && userId === currentUser.id) {
    return {
      id: currentUser.id,
      name: currentUser.name,
      subtitle: currentUser.subtitle,
      bio: currentUser.bio,
      avatarInitials: currentUser.avatarInitials,
      avatarColor: currentUser.avatarColor,
      avatarUri: getCanonicalProfilePhotoDisplayUri() ?? currentUser.avatarUri ?? null,
      connectionStatus,
      isSelf: false,
    };
  }

  const demo = resolveExploreDemoOwnerProfile(userId);
  if (demo) return demo;

  if (isDemoVisitorMutualProfileOwner(userId)) {
    return resolveDemoVisitorMutualProfile();
  }

  const devOnly = resolveDevOnlyOrbitProfile(userId);
  if (devOnly) return devOnly;

  const user = orbitUsers.find((entry) => entry.id === userId);
  if (!user) return null;

  return {
    id: user.id,
    name: user.name,
    subtitle: user.label,
    bio: `Walking a path of ${user.themes.join(' and ')}.`,
    avatarInitials: user.avatarInitials,
    avatarColor: user.avatarColor,
    connectionStatus,
    isSelf: false,
  };
}
