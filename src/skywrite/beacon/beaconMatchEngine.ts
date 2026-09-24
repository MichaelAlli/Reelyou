import { currentUser } from '@/data/mockData';
import { resolveSkyAreaLabel } from '@/skyAreas/skyAreaDefinition';
import { getSkyAreaCategory, isSkyAreaCategoryId } from '@/skyAreas/skyAreaCategory';
import type { SkyAreaPreferencesRecord } from '@/skyAreas/skyAreaPreferencesTypes';
import {
  BEACON_ACTIVE_LIFECYCLE_MS,
  BEACON_FIRST_REMATCH_DELAY_MS,
  BEACON_LATER_REMATCH_DELAY_MS,
  BEACON_RECIPIENTS_PER_WAVE,
  BEACON_SECOND_REMATCH_DELAY_MS,
} from '@/skywrite/beacon/beaconLifecycleConfig';
import {
  beaconMatchId,
  isTerminalMatchStatus,
  type BeaconMatch,
  type BeaconMatchStatus,
  type BeaconSystemState,
  type SkywriteBeaconLifecycle,
  type SkywriteBeaconStatus,
} from '@/skywrite/beacon/beaconLifecycleTypes';
import { isRecipientEligibleForSkywriteBeacon } from '@/skywrite/beacon/beaconRecipientEligibility';
import { collectPublicSkywritesForBeacon } from '@/skywrite/beacon/skywriteBeaconEligibility';
import { isBeaconIntentEligible, resolveSkywriteIntent } from '@/skywrite/skywriteIntent';
import type { SkywriteRecord } from '@/skywrite/types';

/** Beta recipient pool — rematch rotation; primary viewer is current user. */
export const BETA_BEACON_RECIPIENT_POOL: readonly string[] = [
  'user-michael',
  'user-beta-alex',
  'user-beta-sage',
  'user-beta-river',
] as const;

export interface BeaconEligibleSkywrite {
  skywrite: SkywriteRecord & { authorId: string };
  authorId: string;
  skyAreaId: string;
  areaLabel: string;
  intentLabel: string;
  createdAtMs: number;
  beaconMatchId: string;
  rematchCycle: number;
}

function resolveAreaLabel(skyAreaId: string, prefs: SkyAreaPreferencesRecord): string {
  const fromCatalog = resolveSkyAreaLabel(skyAreaId, prefs.customAreas);
  if (fromCatalog) return fromCatalog;
  if (isSkyAreaCategoryId(skyAreaId)) {
    return getSkyAreaCategory(skyAreaId).label;
  }
  return skyAreaId.replace(/^custom-/, '').replace(/-/g, ' ');
}

function intentHumanLabel(record: SkywriteRecord): string {
  const intent = resolveSkywriteIntent(record);
  if (intent === 'question' || intent === 'perspective') return 'looking for perspective';
  return 'sharing in the Sky';
}

function computeNextRematchAt(lifecycle: SkywriteBeaconLifecycle, now: number): number {
  const cycle = lifecycle.rematchCycle;
  if (cycle <= 0) return lifecycle.firstBeaconedAt + BEACON_FIRST_REMATCH_DELAY_MS;
  if (cycle === 1) return lifecycle.lastBeaconedAt + BEACON_SECOND_REMATCH_DELAY_MS;
  return lifecycle.lastBeaconedAt + BEACON_LATER_REMATCH_DELAY_MS;
}

function ensureLifecycle(
  skywrite: SkywriteRecord & { authorId: string },
  existing: SkywriteBeaconLifecycle | undefined,
  now: number,
): SkywriteBeaconLifecycle {
  if (existing) return existing;
  const first = now;
  return {
    skywriteId: skywrite.id,
    beaconEligible: isBeaconIntentEligible(skywrite) && skywrite.visibility === 'public',
    beaconStatus: 'active',
    firstBeaconedAt: first,
    lastBeaconedAt: first,
    nextEligibleRematchAt: first,
    rematchCycle: 0,
    activeUntil: first + BEACON_ACTIVE_LIFECYCLE_MS,
    resolvedAt: null,
    pausedAt: null,
    reactivatedAt: null,
  };
}

function refreshLifecycleStatus(
  lifecycle: SkywriteBeaconLifecycle,
  skywrite: SkywriteRecord & { authorId: string },
  now: number,
): SkywriteBeaconLifecycle {
  let next = { ...lifecycle };

  if (skywrite.visibility !== 'public' || !isBeaconIntentEligible(skywrite)) {
    next.beaconEligible = false;
    if (next.beaconStatus === 'active') {
      next.beaconStatus = 'paused';
      next.pausedAt = next.pausedAt ?? now;
    }
    return next;
  }

  next.beaconEligible = true;

  if (next.beaconStatus === 'resolved' || next.beaconStatus === 'resting') {
    return next;
  }

  if (now >= next.activeUntil && next.beaconStatus === 'active') {
    next.beaconStatus = 'expired';
    return next;
  }

  if (next.beaconStatus === 'paused' && skywrite.visibility === 'public') {
    next.beaconStatus = 'active';
    next.pausedAt = null;
  }

  return next;
}

function recipientHasTerminalMatch(
  matches: BeaconMatch[],
  skywriteId: string,
  recipientUserId: string,
): boolean {
  return matches.some(
    (entry) =>
      entry.skywriteId === skywriteId &&
      entry.recipientUserId === recipientUserId &&
      isTerminalMatchStatus(entry.status),
  );
}

function countActiveMatchesForRecipient(matches: BeaconMatch[], recipientUserId: string): number {
  return matches.filter(
    (entry) =>
      entry.recipientUserId === recipientUserId &&
      (entry.status === 'pending' || entry.status === 'delivered' || entry.status === 'viewed'),
  ).length;
}

function createMatch(
  skywrite: SkywriteRecord & { authorId: string },
  recipientUserId: string,
  rematchCycle: number,
  now: number,
): BeaconMatch {
  const id = beaconMatchId(skywrite.id, recipientUserId, rematchCycle);
  return {
    beaconMatchId: id,
    skywriteId: skywrite.id,
    recipientUserId,
    matchedSkyAreaId: skywrite.skyAreaId!,
    matchedAt: now,
    deliveredAt: now,
    viewedAt: null,
    respondedAt: null,
    ignoredAt: null,
    status: 'delivered',
    rematchCycle,
    eligibilityReason: 'sky_area_match',
    createdAt: now,
  };
}

function deliverRematchWave(
  skywrite: SkywriteRecord & { authorId: string },
  lifecycle: SkywriteBeaconLifecycle,
  matches: BeaconMatch[],
  prefs: SkyAreaPreferencesRecord,
  blockedUserIds: readonly string[],
  recipientPool: readonly string[],
  now: number,
): { lifecycle: SkywriteBeaconLifecycle; matches: BeaconMatch[]; added: BeaconMatch[] } {
  const added: BeaconMatch[] = [];
  const cycle = lifecycle.rematchCycle;

  const candidates = [...recipientPool]
    .filter((recipientId) => recipientId !== skywrite.authorId)
    .filter(
      (recipientId) =>
        !recipientHasTerminalMatch(matches, skywrite.id, recipientId) &&
        !matches.some(
          (m) =>
            m.skywriteId === skywrite.id &&
            m.recipientUserId === recipientId &&
            m.rematchCycle === cycle,
        ),
    )
    .filter((recipientId) => {
      const prefsForBeta =
        recipientId === currentUser.id
          ? prefs
          : prefs; /* Beta: shared prefs shape for simulated recipients in tests */
      return isRecipientEligibleForSkywriteBeacon(skywrite, recipientId, prefsForBeta, blockedUserIds);
    })
    .sort(
      (a, b) =>
        countActiveMatchesForRecipient(matches, a) - countActiveMatchesForRecipient(matches, b),
    );

  const selected = candidates.slice(0, BEACON_RECIPIENTS_PER_WAVE);
  for (const recipientId of selected) {
    added.push(createMatch(skywrite, recipientId, cycle, now));
  }

  const nextLifecycle: SkywriteBeaconLifecycle = {
    ...lifecycle,
    rematchCycle: cycle + 1,
    lastBeaconedAt: now,
    nextEligibleRematchAt: computeNextRematchAt(
      { ...lifecycle, rematchCycle: cycle + 1, lastBeaconedAt: now },
      now,
    ),
  };

  return {
    lifecycle: nextLifecycle,
    matches: [...matches, ...added],
    added,
  };
}

export function syncBeaconSystem(input: {
  state: BeaconSystemState;
  localPosts: readonly SkywriteRecord[];
  prefs: SkyAreaPreferencesRecord;
  blockedUserIds: readonly string[];
  now: number;
  recipientPool?: readonly string[];
}): BeaconSystemState {
  const pool = input.recipientPool ?? BETA_BEACON_RECIPIENT_POOL;
  const catalog = collectPublicSkywritesForBeacon(input.localPosts);
  let lifecycles = { ...input.state.lifecycles };
  let matches = [...input.state.matches];

  for (const skywrite of catalog) {
    let lifecycle = ensureLifecycle(skywrite, lifecycles[skywrite.id], input.now);
    lifecycle = refreshLifecycleStatus(lifecycle, skywrite, input.now);
    lifecycles[skywrite.id] = lifecycle;

    if (lifecycle.beaconStatus !== 'active' || !lifecycle.beaconEligible) continue;

    const due = input.now >= lifecycle.nextEligibleRematchAt && input.now < lifecycle.activeUntil;
    if (!due) continue;

    const wave = deliverRematchWave(
      skywrite,
      lifecycle,
      matches,
      input.prefs,
      input.blockedUserIds,
      pool,
      input.now,
    );
    lifecycles[skywrite.id] = wave.lifecycle;
    matches = wave.matches;
  }

  return {
    lifecycles,
    matches,
    updatedAt: input.now,
  };
}

export function buildViewerBeaconQueue(input: {
  state: BeaconSystemState;
  localPosts: readonly SkywriteRecord[];
  viewerId: string;
  prefs: SkyAreaPreferencesRecord;
  blockedUserIds: readonly string[];
  now: number;
}): BeaconEligibleSkywrite[] {
  const catalog = collectPublicSkywritesForBeacon(input.localPosts, input.viewerId);
  const byId = new Map(catalog.map((entry) => [entry.id, entry]));
  const out: BeaconEligibleSkywrite[] = [];

  for (const match of input.state.matches) {
    if (match.recipientUserId !== input.viewerId) continue;
    if (match.status !== 'delivered' && match.status !== 'pending' && match.status !== 'viewed') {
      continue;
    }

    const skywrite = byId.get(match.skywriteId);
    if (!skywrite) continue;

    const lifecycle = input.state.lifecycles[match.skywriteId];
    if (!lifecycle || lifecycle.beaconStatus !== 'active') continue;

    if (
      !isRecipientEligibleForSkywriteBeacon(
        skywrite,
        input.viewerId,
        input.prefs,
        input.blockedUserIds,
      )
    ) {
      continue;
    }

    const skyAreaId = skywrite.skyAreaId!;
    const createdAtMs = Date.parse(skywrite.createdAt) || input.now;
    out.push({
      skywrite,
      authorId: skywrite.authorId,
      skyAreaId,
      areaLabel: resolveAreaLabel(skyAreaId, input.prefs),
      intentLabel: intentHumanLabel(skywrite),
      createdAtMs,
      beaconMatchId: match.beaconMatchId,
      rematchCycle: match.rematchCycle,
    });
  }

  return out.sort((a, b) => b.createdAtMs - a.createdAtMs);
}

export function updateMatchStatus(
  state: BeaconSystemState,
  skywriteId: string,
  recipientUserId: string,
  status: BeaconMatchStatus,
  now: number,
): BeaconSystemState {
  const matches = state.matches.map((entry) => {
    if (entry.skywriteId !== skywriteId || entry.recipientUserId !== recipientUserId) {
      return entry;
    }
    if (isTerminalMatchStatus(entry.status)) return entry;
    return {
      ...entry,
      status,
      ignoredAt: status === 'ignored' || status === 'dismissed' ? now : entry.ignoredAt,
      respondedAt: status === 'responded' ? now : entry.respondedAt,
      viewedAt: status === 'viewed' ? now : entry.viewedAt,
    };
  });

  return { ...state, matches, updatedAt: now };
}

export function setAuthorBeaconResolved(
  state: BeaconSystemState,
  skywriteId: string,
  resolved: boolean,
  now: number,
): BeaconSystemState {
  const existing = state.lifecycles[skywriteId];
  if (!existing) return state;

  const lifecycles = {
    ...state.lifecycles,
    [skywriteId]: {
      ...existing,
      beaconStatus: (resolved ? 'resolved' : 'active') as SkywriteBeaconStatus,
      resolvedAt: resolved ? now : null,
      reactivatedAt: resolved ? existing.reactivatedAt : now,
      nextEligibleRematchAt: resolved ? existing.nextEligibleRematchAt : now,
    },
  };

  return { ...state, lifecycles, updatedAt: now };
}

export function reactivateAuthorBeacon(
  state: BeaconSystemState,
  skywriteId: string,
  now: number,
): BeaconSystemState {
  const existing = state.lifecycles[skywriteId];
  if (!existing) return state;
  const lifecycles = {
    ...state.lifecycles,
    [skywriteId]: {
      ...existing,
      beaconStatus: 'active' as SkywriteBeaconStatus,
      resolvedAt: null,
      reactivatedAt: now,
      nextEligibleRematchAt: now,
      activeUntil: Math.max(existing.activeUntil, now + BEACON_ACTIVE_LIFECYCLE_MS),
    },
  };
  return { ...state, lifecycles, updatedAt: now };
}
