import type { SkyArea } from '@/skyAreas/skyAreaDefinition';

export interface UserSkyAreaPreference {
  skyAreaId: string;
  selected: boolean;
  beaconEnabled: boolean;
  createdAt: number;
  updatedAt: number;
}

/** Private owner preferences — not exposed on public profile by default. */
export interface SkyAreaPreferencesRecord {
  userId: string;
  stillDiscovering: boolean;
  pauseAllBeacons: boolean;
  preferences: UserSkyAreaPreference[];
  customAreas: SkyArea[];
  updatedAt: number;
}

export const BETA_OWNER_USER_ID = 'user-michael';

export function emptySkyAreaPreferences(userId: string = BETA_OWNER_USER_ID): SkyAreaPreferencesRecord {
  return {
    userId,
    stillDiscovering: false,
    pauseAllBeacons: false,
    preferences: [],
    customAreas: [],
    updatedAt: 0,
  };
}
