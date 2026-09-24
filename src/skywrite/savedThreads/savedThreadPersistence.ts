import AsyncStorage from '@react-native-async-storage/async-storage';

import type { HumanPotentialEvidenceRecord } from '@/humanPotential/humanPotentialEvidenceTypes';
import { ensureLegacyDemoSeed } from '@/legacy/ensureLegacyDemoSeed';
import {
  EMPTY_SAVED_THREADS_STATE,
  type GrowthEmotionalTag,
  type GrowthMicroChoice,
  type GrowthMomentKind,
  type SavedThreadRecord,
  type SavedThreadsState,
  type ThreadReflectionRecord,
} from '@/skywrite/savedThreads/savedThreadTypes';

const KEY = '@reellyou/saved-skywrite-threads';

function parseSavedThread(raw: unknown): SavedThreadRecord | null {
  if (!raw || typeof raw !== 'object') return null;
  const entry = raw as Partial<SavedThreadRecord>;
  if (typeof entry.savedThreadId !== 'string' || typeof entry.skywriteId !== 'string') return null;
  if (typeof entry.ownerUserId !== 'string' || typeof entry.threadId !== 'string') return null;
  const status = entry.status === 'archived' ? 'archived' : 'active';
  return {
    savedThreadId: entry.savedThreadId,
    ownerUserId: entry.ownerUserId,
    skywriteId: entry.skywriteId,
    threadId: entry.threadId,
    skyAreaId: typeof entry.skyAreaId === 'string' ? entry.skyAreaId : null,
    originalAuthorId: typeof entry.originalAuthorId === 'string' ? entry.originalAuthorId : entry.ownerUserId,
    visibilitySnapshot:
      entry.visibilitySnapshot === 'private' ||
      entry.visibilitySnapshot === 'orbit' ||
      entry.visibilitySnapshot === 'sky_friends' ||
      entry.visibilitySnapshot === 'public'
        ? entry.visibilitySnapshot
        : 'public',
    savedAt: typeof entry.savedAt === 'number' ? entry.savedAt : Date.now(),
    lastVisitedAt: typeof entry.lastVisitedAt === 'number' ? entry.lastVisitedAt : Date.now(),
    visitCount: typeof entry.visitCount === 'number' ? entry.visitCount : 0,
    archivedAt: typeof entry.archivedAt === 'number' ? entry.archivedAt : null,
    status,
    createdAt: typeof entry.createdAt === 'number' ? entry.createdAt : Date.now(),
    updatedAt: typeof entry.updatedAt === 'number' ? entry.updatedAt : Date.now(),
  };
}

function parseReflection(raw: unknown): ThreadReflectionRecord | null {
  if (!raw || typeof raw !== 'object') return null;
  const entry = raw as Partial<ThreadReflectionRecord>;
  if (typeof entry.reflectionId !== 'string' || typeof entry.savedThreadId !== 'string') return null;
  if (typeof entry.authorUserId !== 'string' || typeof entry.body !== 'string') return null;
  const momentKind = parseMomentKind(entry.momentKind);
  const microChoice = parseMicroChoice(entry.microChoice);
  return {
    reflectionId: entry.reflectionId,
    savedThreadId: entry.savedThreadId,
    authorUserId: entry.authorUserId,
    body: entry.body,
    createdAt: typeof entry.createdAt === 'number' ? entry.createdAt : Date.now(),
    updatedAt: typeof entry.updatedAt === 'number' ? entry.updatedAt : Date.now(),
    deletedAt: typeof entry.deletedAt === 'number' ? entry.deletedAt : null,
    visibility: 'private',
    momentKind,
    microChoice,
    audioUri: typeof entry.audioUri === 'string' ? entry.audioUri : null,
    audioDurationMs: typeof entry.audioDurationMs === 'number' ? entry.audioDurationMs : null,
    emotionalTags: parseEmotionalTags(entry.emotionalTags),
    sourceResponseId:
      typeof entry.sourceResponseId === 'string' ? entry.sourceResponseId : undefined,
    sourceContributionId:
      typeof entry.sourceContributionId === 'string' ? entry.sourceContributionId : undefined,
  };
}

function parseMomentKind(value: unknown): GrowthMomentKind {
  if (
    value === 'stayed_with_me' ||
    value === 'used_this' ||
    value === 'see_differently' ||
    value === 'less_alone' ||
    value === 'hope' ||
    value === 'perspective' ||
    value === 'freeform'
  ) {
    return value;
  }
  return 'freeform';
}

function parseMicroChoice(value: unknown): GrowthMicroChoice | undefined {
  if (value === 'yes' || value === 'a_little' || value === 'not_really' || value === 'skip') {
    return value;
  }
  return undefined;
}

function parseEmotionalTags(raw: unknown): GrowthEmotionalTag[] | undefined {
  if (!Array.isArray(raw)) return undefined;
  const tags = raw.filter(
    (tag): tag is GrowthEmotionalTag =>
      tag === 'less_alone' || tag === 'hope' || tag === 'supported' || tag === 'direction',
  );
  return tags.length ? tags : undefined;
}

function parseEvidence(raw: unknown): HumanPotentialEvidenceRecord | null {
  if (!raw || typeof raw !== 'object') return null;
  const entry = raw as Partial<HumanPotentialEvidenceRecord>;
  if (typeof entry.evidenceId !== 'string' || typeof entry.userId !== 'string') return null;
  if (
    entry.evidenceType !== 'learning' &&
    entry.evidenceType !== 'application' &&
    entry.evidenceType !== 'impact' &&
    entry.evidenceType !== 'ripple'
  ) {
    return null;
  }
  return {
    evidenceId: entry.evidenceId,
    userId: entry.userId,
    evidenceType: entry.evidenceType,
    sourceType:
      entry.sourceType === 'saved_thread' || entry.sourceType === 'contribution'
        ? entry.sourceType
        : 'reflection',
    sourceId: typeof entry.sourceId === 'string' ? entry.sourceId : entry.evidenceId,
    savedThreadId: typeof entry.savedThreadId === 'string' ? entry.savedThreadId : undefined,
    reflectionId: typeof entry.reflectionId === 'string' ? entry.reflectionId : undefined,
    sourceSkywriteId: typeof entry.sourceSkywriteId === 'string' ? entry.sourceSkywriteId : undefined,
    sourceResponseId: typeof entry.sourceResponseId === 'string' ? entry.sourceResponseId : undefined,
    contributionId: typeof entry.contributionId === 'string' ? entry.contributionId : undefined,
    createdAt: typeof entry.createdAt === 'number' ? entry.createdAt : Date.now(),
    userConfirmed: entry.userConfirmed === true,
    visibility: 'private',
    note: typeof entry.note === 'string' ? entry.note : undefined,
  };
}

export function parseSavedThreadsState(raw: string | null): SavedThreadsState {
  if (!raw) return EMPTY_SAVED_THREADS_STATE;
  try {
    const parsed = JSON.parse(raw) as Partial<SavedThreadsState>;
    const savedThreads = Array.isArray(parsed.savedThreads)
      ? parsed.savedThreads.map(parseSavedThread).filter((e): e is SavedThreadRecord => e !== null)
      : [];
    const reflections = Array.isArray(parsed.reflections)
      ? parsed.reflections.map(parseReflection).filter((e): e is ThreadReflectionRecord => e !== null)
      : [];
    const evidence = Array.isArray(parsed.evidence)
      ? parsed.evidence.map(parseEvidence).filter((e): e is HumanPotentialEvidenceRecord => e !== null)
      : [];
    return {
      savedThreads,
      reflections,
      evidence,
      updatedAt: typeof parsed.updatedAt === 'number' ? parsed.updatedAt : Date.now(),
    };
  } catch {
    return EMPTY_SAVED_THREADS_STATE;
  }
}

export async function loadSavedThreadsState(): Promise<SavedThreadsState> {
  await ensureLegacyDemoSeed();
  const raw = await AsyncStorage.getItem(KEY);
  return parseSavedThreadsState(raw);
}

export async function saveSavedThreadsState(state: SavedThreadsState): Promise<void> {
  await AsyncStorage.setItem(KEY, JSON.stringify(state));
}
