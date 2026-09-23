import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  EMPTY_BEACON_SYSTEM_STATE,
  type BeaconMatch,
  type BeaconSystemState,
  type SkywriteBeaconLifecycle,
} from '@/skywrite/beacon/beaconLifecycleTypes';

const STORAGE_KEY = '@reellyou/skywrite-beacon-lifecycle';

function parseLifecycle(raw: unknown): SkywriteBeaconLifecycle | null {
  if (!raw || typeof raw !== 'object') return null;
  const entry = raw as Partial<SkywriteBeaconLifecycle>;
  if (typeof entry.skywriteId !== 'string') return null;
  const status = entry.beaconStatus;
  const beaconStatus =
    status === 'resolved' ||
    status === 'resting' ||
    status === 'expired' ||
    status === 'paused' ||
    status === 'active'
      ? status
      : 'active';
  return {
    skywriteId: entry.skywriteId,
    beaconEligible: entry.beaconEligible !== false,
    beaconStatus,
    firstBeaconedAt: typeof entry.firstBeaconedAt === 'number' ? entry.firstBeaconedAt : 0,
    lastBeaconedAt: typeof entry.lastBeaconedAt === 'number' ? entry.lastBeaconedAt : 0,
    nextEligibleRematchAt:
      typeof entry.nextEligibleRematchAt === 'number' ? entry.nextEligibleRematchAt : 0,
    rematchCycle: typeof entry.rematchCycle === 'number' ? entry.rematchCycle : 0,
    activeUntil: typeof entry.activeUntil === 'number' ? entry.activeUntil : 0,
    resolvedAt: typeof entry.resolvedAt === 'number' ? entry.resolvedAt : null,
    pausedAt: typeof entry.pausedAt === 'number' ? entry.pausedAt : null,
    reactivatedAt: typeof entry.reactivatedAt === 'number' ? entry.reactivatedAt : null,
  };
}

function parseMatch(raw: unknown): BeaconMatch | null {
  if (!raw || typeof raw !== 'object') return null;
  const entry = raw as Partial<BeaconMatch>;
  if (typeof entry.beaconMatchId !== 'string' || typeof entry.skywriteId !== 'string') return null;
  if (typeof entry.recipientUserId !== 'string') return null;
  const status = entry.status ?? 'delivered';
  return {
    beaconMatchId: entry.beaconMatchId,
    skywriteId: entry.skywriteId,
    recipientUserId: entry.recipientUserId,
    matchedSkyAreaId: typeof entry.matchedSkyAreaId === 'string' ? entry.matchedSkyAreaId : 'growth',
    matchedAt: typeof entry.matchedAt === 'number' ? entry.matchedAt : Date.now(),
    deliveredAt: typeof entry.deliveredAt === 'number' ? entry.deliveredAt : null,
    viewedAt: typeof entry.viewedAt === 'number' ? entry.viewedAt : null,
    respondedAt: typeof entry.respondedAt === 'number' ? entry.respondedAt : null,
    ignoredAt: typeof entry.ignoredAt === 'number' ? entry.ignoredAt : null,
    status:
      status === 'pending' ||
      status === 'delivered' ||
      status === 'viewed' ||
      status === 'ignored' ||
      status === 'responded' ||
      status === 'dismissed' ||
      status === 'ineligible'
        ? status
        : 'delivered',
    rematchCycle: typeof entry.rematchCycle === 'number' ? entry.rematchCycle : 0,
    eligibilityReason: typeof entry.eligibilityReason === 'string' ? entry.eligibilityReason : 'sky_area_match',
    createdAt: typeof entry.createdAt === 'number' ? entry.createdAt : Date.now(),
  };
}

export function parseBeaconSystemState(raw: string | null): BeaconSystemState {
  if (!raw) return EMPTY_BEACON_SYSTEM_STATE;
  try {
    const parsed = JSON.parse(raw) as Partial<BeaconSystemState>;
    const lifecycles: Record<string, SkywriteBeaconLifecycle> = {};
    if (parsed.lifecycles && typeof parsed.lifecycles === 'object') {
      for (const [key, value] of Object.entries(parsed.lifecycles)) {
        const lifecycle = parseLifecycle(value);
        if (lifecycle) lifecycles[key] = lifecycle;
      }
    }
    const matches = Array.isArray(parsed.matches)
      ? parsed.matches.map(parseMatch).filter((entry): entry is BeaconMatch => entry !== null)
      : [];
    return {
      lifecycles,
      matches,
      updatedAt: typeof parsed.updatedAt === 'number' ? parsed.updatedAt : 0,
    };
  } catch {
    return EMPTY_BEACON_SYSTEM_STATE;
  }
}

export async function loadBeaconSystemState(): Promise<BeaconSystemState> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    return parseBeaconSystemState(raw);
  } catch {
    return EMPTY_BEACON_SYSTEM_STATE;
  }
}

export async function saveBeaconSystemState(state: BeaconSystemState): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Non-blocking.
  }
}
