import { currentUser } from '@/data/mockData';
import type { SkyAreaCategoryId } from '@/skyAreas/skyAreaCategory';
import {
  isSkyAreaSelected,
  setSkyAreaBeaconEnabled,
  toggleSkyAreaSelection,
} from '@/skyAreas/skyAreaPreferencesLogic';
import type { SkyAreaPreferencesRecord } from '@/skyAreas/skyAreaPreferencesTypes';
import {
  BEACON_ACTIVE_LIFECYCLE_MS,
  BEACON_FIRST_REMATCH_DELAY_MS,
} from '@/skywrite/beacon/beaconLifecycleConfig';
import {
  beaconMatchId,
  type BeaconMatch,
  type BeaconSystemState,
  type SkywriteBeaconLifecycle,
} from '@/skywrite/beacon/beaconLifecycleTypes';
import type { SkywriteRecord } from '@/skywrite/types';

/** Dev-only demo catalog — stable ids for canonical beacon records. */
export const CONTRIBUTION_BEACON_DEMO_COUNT = 12;

export const CONTRIBUTION_BEACON_DEMO_SKYWRITE_ID_PREFIX = 'demo-contrib-beacon-';

const DEMO_VIEWER_ID = currentUser.id;

const DEMO_AUTHOR_IDS = [
  'orbit-jordan',
  'orbit-1',
  'orbit-2',
  'orbit-3',
  'orbit-4',
  'orbit-5',
] as const;

const DEMO_AREA_ROTATION: readonly SkyAreaCategoryId[] = [
  'growth',
  'purpose',
  'creativity',
  'career',
  'relationships',
  'growth',
  'purpose',
  'creativity',
  'career',
  'relationships',
  'growth',
  'purpose',
];

const DEMO_INTENTS: readonly ('question' | 'perspective')[] = [
  'question',
  'perspective',
  'question',
  'perspective',
  'question',
  'perspective',
  'question',
  'perspective',
  'question',
  'perspective',
  'question',
  'perspective',
];

export function isContributionBeaconDemoSkywriteId(skywriteId: string): boolean {
  return skywriteId.startsWith(CONTRIBUTION_BEACON_DEMO_SKYWRITE_ID_PREFIX);
}

export function buildDemoContributionBeaconSkywrites(): Array<SkywriteRecord & { authorId: string }> {
  const baseMs = Date.now() - 3600_000;
  const out: Array<SkywriteRecord & { authorId: string }> = [];

  for (let i = 0; i < CONTRIBUTION_BEACON_DEMO_COUNT; i += 1) {
    const id = `${CONTRIBUTION_BEACON_DEMO_SKYWRITE_ID_PREFIX}${String(i + 1).padStart(2, '0')}`;
    const authorId = DEMO_AUTHOR_IDS[i % DEMO_AUTHOR_IDS.length]!;
    const skyAreaId = DEMO_AREA_ROTATION[i]!;
    const intent = DEMO_INTENTS[i]!;
    out.push({
      id,
      authorId,
      text:
        intent === 'question'
          ? `Demo beacon ${i + 1}: What has helped you in ${skyAreaId.replace('-', ' ')} lately?`
          : `Demo beacon ${i + 1}: Looking for perspective on a ${skyAreaId.replace('-', ' ')} crossroad.`,
      textStyle: 'plain',
      media: { photo: null, audio: null },
      mediaMode: 'text',
      visibility: 'public',
      mood: 'reflective',
      showingUp: intent === 'question' ? 'question' : 'reflection',
      intent,
      userHashtags: [skyAreaId],
      skyAreaId,
      animateToSky: false,
      allowAIContext: true,
      createdAt: new Date(baseMs - i * 60_000).toISOString(),
    });
  }

  return out;
}

/** Ensures demo Sky Areas are selected with beacons on — dev demo routing only. */
export function withContributionBeaconDemoPrefs(
  record: SkyAreaPreferencesRecord,
): SkyAreaPreferencesRecord {
  let next: SkyAreaPreferencesRecord = {
    ...record,
    pauseAllBeacons: false,
    stillDiscovering: false,
  };
  for (const skyAreaId of DEMO_AREA_ROTATION) {
    if (!isSkyAreaSelected(next, skyAreaId)) {
      next = toggleSkyAreaSelection(next, skyAreaId);
    }
    next = setSkyAreaBeaconEnabled(next, skyAreaId, true);
  }
  return next;
}

function buildDemoLifecycle(skywriteId: string, now: number): SkywriteBeaconLifecycle {
  return {
    skywriteId,
    beaconEligible: true,
    beaconStatus: 'active',
    firstBeaconedAt: now,
    lastBeaconedAt: now,
    nextEligibleRematchAt: now + BEACON_FIRST_REMATCH_DELAY_MS,
    rematchCycle: 1,
    activeUntil: now + BEACON_ACTIVE_LIFECYCLE_MS,
    resolvedAt: null,
    pausedAt: null,
    reactivatedAt: null,
  };
}

function buildDemoMatch(
  skywrite: SkywriteRecord & { authorId: string },
  now: number,
): BeaconMatch {
  const rematchCycle = 0;
  return {
    beaconMatchId: beaconMatchId(skywrite.id, DEMO_VIEWER_ID, rematchCycle),
    skywriteId: skywrite.id,
    recipientUserId: DEMO_VIEWER_ID,
    matchedSkyAreaId: skywrite.skyAreaId!,
    matchedAt: now,
    deliveredAt: now,
    viewedAt: null,
    respondedAt: null,
    ignoredAt: null,
    status: 'delivered',
    rematchCycle,
    eligibilityReason: 'demo_fixture',
    createdAt: now,
  };
}

/**
 * Merge canonical demo lifecycles + matches for the current demo user.
 * Preserves non-demo beacon state; refreshes demo rows unless viewer already terminal on that id.
 */
export function mergeContributionBeaconDemoState(
  state: BeaconSystemState,
  now: number,
): BeaconSystemState {
  const demoSkywrites = buildDemoContributionBeaconSkywrites();
  const demoIds = new Set(demoSkywrites.map((entry) => entry.id));

  const lifecycles = { ...state.lifecycles };
  for (const key of Object.keys(lifecycles)) {
    if (isContributionBeaconDemoSkywriteId(key)) {
      delete lifecycles[key];
    }
  }

  const retainedMatches = state.matches.filter((match) => {
    if (!isContributionBeaconDemoSkywriteId(match.skywriteId)) return true;
    if (match.recipientUserId !== DEMO_VIEWER_ID) return false;
    return match.status === 'ignored' || match.status === 'responded' || match.status === 'dismissed';
  });

  const terminalDemoIds = new Set(
    retainedMatches
      .filter((match) => match.recipientUserId === DEMO_VIEWER_ID)
      .map((match) => match.skywriteId),
  );

  const addedMatches: BeaconMatch[] = [];
  for (const skywrite of demoSkywrites) {
    lifecycles[skywrite.id] = buildDemoLifecycle(skywrite.id, now);
    if (terminalDemoIds.has(skywrite.id)) continue;
    if (
      retainedMatches.some(
        (match) =>
          match.skywriteId === skywrite.id &&
          match.recipientUserId === DEMO_VIEWER_ID &&
          match.status === 'delivered',
      )
    ) {
      continue;
    }
    addedMatches.push(buildDemoMatch(skywrite, now));
  }

  const matches = [...retainedMatches, ...addedMatches].filter((match) => {
    if (!isContributionBeaconDemoSkywriteId(match.skywriteId)) return true;
    return demoIds.has(match.skywriteId);
  });

  return {
    lifecycles,
    matches,
    updatedAt: now,
  };
}
