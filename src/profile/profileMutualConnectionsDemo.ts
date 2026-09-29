import type { SkyOwnerProfile } from '@/mySky/skyIdentity';
import type { ProfileRelationshipCounts } from '@/social/skyFollow/profileRelationshipCounts';

/**
 * Development-only fixtures — mutual connections UI on Explore demo Avery Kim.
 * Does not mutate persisted follow graphs or affect production user counts.
 *
 * Open: /visitor-profile?id=demo-sky-avery
 */
export const DEMO_AVERY_KIM_VISITOR_ID = 'demo-sky-avery';

/** @deprecated Legacy Sam Ortiz fixture — same demo graph when opened in dev. */
export const DEMO_VISITOR_MUTUAL_PROFILE_ID = 'demo-visitor-shared-skies';

/** Dev-only orbit account (not in main orbitUsers catalog). */
export const DEMO_ORBIT_DEVIN_ID = 'orbit-devin';

export const DEMO_MUTUAL_CONNECTION_USER_IDS = [
  'orbit-jordan',
  'orbit-3',
  DEMO_ORBIT_DEVIN_ID,
] as const;

/** Skies Avery follows in the dev preview graph (includes all mutuals). */
export const DEMO_AVERY_FOLLOWING_USER_IDS = [
  'orbit-jordan',
  'orbit-3',
  DEMO_ORBIT_DEVIN_ID,
  'orbit-1',
] as const;

/** Accounts following Avery in the dev preview graph (includes all mutuals). */
export const DEMO_AVERY_FOLLOWER_USER_IDS = [
  'orbit-jordan',
  'orbit-3',
  DEMO_ORBIT_DEVIN_ID,
  'orbit-2',
] as const;

const DEMO_AVERY_RELATIONSHIP_COUNTS: ProfileRelationshipCounts = {
  connectedSkies: 3,
  followedSkies: DEMO_AVERY_FOLLOWING_USER_IDS.length,
  skyFollowing: DEMO_AVERY_FOLLOWER_USER_IDS.length,
  mutualConnectionsWithViewer: DEMO_MUTUAL_CONNECTION_USER_IDS.length,
};

export function isDevMutualConnectionsDemoEnabled(): boolean {
  return typeof __DEV__ !== 'undefined' && __DEV__;
}

export function isDemoAveryKimMutualConnectionsProfile(ownerId: string): boolean {
  return isDevMutualConnectionsDemoEnabled() && ownerId === DEMO_AVERY_KIM_VISITOR_ID;
}

/** @deprecated Prefer isDemoAveryKimMutualConnectionsProfile */
export function isDemoVisitorMutualProfileOwner(ownerId: string): boolean {
  return isDevMutualConnectionsDemoEnabled() && ownerId === DEMO_VISITOR_MUTUAL_PROFILE_ID;
}

export function usesDemoMutualConnectionsOverlay(ownerId: string): boolean {
  return (
    isDemoAveryKimMutualConnectionsProfile(ownerId) ||
    isDemoVisitorMutualProfileOwner(ownerId)
  );
}

export function resolveDemoMutualConnectionCounts(
  ownerId: string,
): ProfileRelationshipCounts | null {
  if (!usesDemoMutualConnectionsOverlay(ownerId)) return null;
  return { ...DEMO_AVERY_RELATIONSHIP_COUNTS };
}

export function resolveDemoMutualConnectionUserIds(
  ownerId: string,
  blockedUserIds: readonly string[],
): string[] {
  if (!usesDemoMutualConnectionsOverlay(ownerId)) return [];
  const blocked = new Set(blockedUserIds);
  return DEMO_MUTUAL_CONNECTION_USER_IDS.filter((id) => !blocked.has(id));
}

export function resolveDemoProfileOwnerFollowingIds(ownerId: string): string[] | null {
  if (!usesDemoMutualConnectionsOverlay(ownerId)) return null;
  return [...DEMO_AVERY_FOLLOWING_USER_IDS];
}

export function resolveDemoProfileOwnerFollowerIds(ownerId: string): string[] | null {
  if (!usesDemoMutualConnectionsOverlay(ownerId)) return null;
  return [...DEMO_AVERY_FOLLOWER_USER_IDS];
}

export function resolveDemoMutualConnectionDisplayName(userId: string): string | null {
  if (userId === 'orbit-jordan') return 'Jordan';
  if (userId === 'orbit-3') return 'Maya';
  if (userId === DEMO_ORBIT_DEVIN_ID) return 'Devin';
  return null;
}

export function resolveDevOnlyOrbitProfile(userId: string): SkyOwnerProfile | null {
  if (!isDevMutualConnectionsDemoEnabled()) return null;
  if (userId === DEMO_ORBIT_DEVIN_ID) {
    return {
      id: DEMO_ORBIT_DEVIN_ID,
      name: 'Devin Cole',
      subtitle: 'Demo · Mutual connections preview',
      bio: 'Development fixture — not a real member.',
      avatarInitials: 'DC',
      avatarColor: '#5B8DEF',
      isSelf: false,
      connectionStatus: 'none',
    };
  }
  return null;
}

export function resolveDemoVisitorMutualProfile(): SkyOwnerProfile {
  return {
    id: DEMO_VISITOR_MUTUAL_PROFILE_ID,
    name: 'Sam Ortiz',
    subtitle: 'Demo · Shared skies preview',
    bio: 'Development fixture for visitor mutual-connections UI.',
    avatarInitials: 'SO',
    avatarColor: '#8B7EDE',
    isSelf: false,
    connectionStatus: 'none',
  };
}
