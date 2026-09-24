import AsyncStorage from '@react-native-async-storage/async-storage';

import type { ContributionRecord } from '@/contributions/contributionTypes';
import { ensureLegacyDemoSeed } from '@/legacy/ensureLegacyDemoSeed';
import {
  EMPTY_SKYWRITE_THREAD_STATE,
  type SkywriteBeaconEngagement,
  type SkywriteResponseRecord,
  type SkywriteThreadState,
} from '@/skywrite/threads/skywriteThreadTypes';

const THREAD_KEY = '@reellyou/skywrite-threads';
const CONTRIBUTION_KEY = '@reellyou/skywrite-contributions';

function parseResponse(raw: unknown): SkywriteResponseRecord | null {
  if (!raw || typeof raw !== 'object') return null;
  const entry = raw as Partial<SkywriteResponseRecord>;
  if (typeof entry.responseId !== 'string' || typeof entry.skywriteId !== 'string') return null;
  if (typeof entry.responderId !== 'string' || typeof entry.body !== 'string') return null;
  return {
    responseId: entry.responseId,
    skywriteId: entry.skywriteId,
    threadId: typeof entry.threadId === 'string' ? entry.threadId : `thread-${entry.skywriteId}`,
    responderId: entry.responderId,
    body: entry.body,
    createdAt: typeof entry.createdAt === 'number' ? entry.createdAt : Date.now(),
    visibility:
      entry.visibility === 'private' ||
      entry.visibility === 'orbit' ||
      entry.visibility === 'sky_friends'
        ? entry.visibility
        : 'public',
    savedByAuthor: entry.savedByAuthor === true,
    savedAt: typeof entry.savedAt === 'number' ? entry.savedAt : null,
  };
}

export function parseSkywriteThreadState(raw: string | null): SkywriteThreadState {
  if (!raw) return EMPTY_SKYWRITE_THREAD_STATE;
  try {
    const parsed = JSON.parse(raw) as Partial<SkywriteThreadState>;
    const responses = Array.isArray(parsed.responses)
      ? parsed.responses.map(parseResponse).filter((entry): entry is SkywriteResponseRecord => entry !== null)
      : [];
    const beaconEngagementBySkywriteId: Record<string, SkywriteBeaconEngagement> = {};
    if (parsed.beaconEngagementBySkywriteId && typeof parsed.beaconEngagementBySkywriteId === 'object') {
      for (const [key, value] of Object.entries(parsed.beaconEngagementBySkywriteId)) {
        if (value === 'ignored' || value === 'responded') {
          beaconEngagementBySkywriteId[key] = value;
        }
      }
    }
    return {
      responses,
      beaconEngagementBySkywriteId,
      updatedAt: typeof parsed.updatedAt === 'number' ? parsed.updatedAt : 0,
    };
  } catch {
    return EMPTY_SKYWRITE_THREAD_STATE;
  }
}

function parseContribution(raw: unknown): ContributionRecord | null {
  if (!raw || typeof raw !== 'object') return null;
  const entry = raw as Partial<ContributionRecord>;
  if (typeof entry.contributionId !== 'string') return null;
  if (typeof entry.responderId !== 'string') return null;
  if (typeof entry.sourceSkywriteId !== 'string') return null;
  if (typeof entry.sourceResponseId !== 'string') return null;
  return {
    contributionId: entry.contributionId,
    responderId: entry.responderId,
    sourceSkywriteId: entry.sourceSkywriteId,
    sourceThreadId: entry.sourceThreadId ?? `thread-${entry.sourceSkywriteId}`,
    sourceResponseId: entry.sourceResponseId,
    skyAreaId: typeof entry.skyAreaId === 'string' ? entry.skyAreaId : 'growth',
    contributionType: 'skywrite_response',
    state: entry.state === 'withdrawn' ? 'withdrawn' : 'active',
    createdAt: typeof entry.createdAt === 'number' ? entry.createdAt : Date.now(),
    savedAt: typeof entry.savedAt === 'number' ? entry.savedAt : Date.now(),
    withdrawnAt: typeof entry.withdrawnAt === 'number' ? entry.withdrawnAt : undefined,
  };
}

export async function loadSkywriteThreadState(): Promise<SkywriteThreadState> {
  await ensureLegacyDemoSeed();
  try {
    const raw = await AsyncStorage.getItem(THREAD_KEY);
    return parseSkywriteThreadState(raw);
  } catch {
    return EMPTY_SKYWRITE_THREAD_STATE;
  }
}

export async function saveSkywriteThreadState(state: SkywriteThreadState): Promise<void> {
  try {
    await AsyncStorage.setItem(THREAD_KEY, JSON.stringify(state));
  } catch {
    // Non-blocking.
  }
}

export async function loadContributionRecords(): Promise<ContributionRecord[]> {
  await ensureLegacyDemoSeed();
  try {
    const raw = await AsyncStorage.getItem(CONTRIBUTION_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.map(parseContribution).filter((entry): entry is ContributionRecord => entry !== null);
  } catch {
    return [];
  }
}

export async function saveContributionRecords(records: ContributionRecord[]): Promise<void> {
  try {
    await AsyncStorage.setItem(CONTRIBUTION_KEY, JSON.stringify(records));
  } catch {
    // Non-blocking.
  }
}
