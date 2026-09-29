import type { SkyOwnerProfile } from '@/mySky/skyIdentity';

/**
 * Development-only visitor profile — demonstrates mutual-connections row UI.
 * Does not affect real user counts or production follow graphs.
 *
 * Open: /visitor-profile?id=demo-visitor-shared-skies
 */
export const DEMO_VISITOR_MUTUAL_PROFILE_ID = 'demo-visitor-shared-skies';

export const DEMO_VISITOR_MUTUAL_CONNECTION_USER_IDS = [
  'demo-sky-avery',
  'demo-sky-river',
  'demo-sky-noor',
] as const;

export function isDemoVisitorMutualProfileOwner(ownerId: string): boolean {
  return ownerId === DEMO_VISITOR_MUTUAL_PROFILE_ID;
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
