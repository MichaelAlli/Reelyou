export type SkywriteBeaconStatus =
  | 'active'
  | 'resolved'
  | 'resting'
  | 'expired'
  | 'paused';

export type BeaconMatchStatus =
  | 'pending'
  | 'delivered'
  | 'viewed'
  | 'ignored'
  | 'responded'
  | 'dismissed'
  | 'ineligible';

export interface SkywriteBeaconLifecycle {
  skywriteId: string;
  beaconEligible: boolean;
  beaconStatus: SkywriteBeaconStatus;
  firstBeaconedAt: number;
  lastBeaconedAt: number;
  nextEligibleRematchAt: number;
  rematchCycle: number;
  activeUntil: number;
  resolvedAt: number | null;
  pausedAt: number | null;
  reactivatedAt: number | null;
}

export interface BeaconMatch {
  beaconMatchId: string;
  skywriteId: string;
  recipientUserId: string;
  matchedSkyAreaId: string;
  matchedAt: number;
  deliveredAt: number | null;
  viewedAt: number | null;
  respondedAt: number | null;
  ignoredAt: number | null;
  status: BeaconMatchStatus;
  rematchCycle: number;
  eligibilityReason: string;
  createdAt: number;
}

export interface BeaconSystemState {
  lifecycles: Record<string, SkywriteBeaconLifecycle>;
  matches: BeaconMatch[];
  updatedAt: number;
}

export const EMPTY_BEACON_SYSTEM_STATE: BeaconSystemState = {
  lifecycles: {},
  matches: [],
  updatedAt: 0,
};

export function beaconMatchId(skywriteId: string, recipientUserId: string, rematchCycle: number): string {
  return `bm-${skywriteId}-${recipientUserId}-c${rematchCycle}`;
}

export function isTerminalMatchStatus(status: BeaconMatchStatus): boolean {
  return status === 'ignored' || status === 'responded' || status === 'dismissed' || status === 'ineligible';
}
