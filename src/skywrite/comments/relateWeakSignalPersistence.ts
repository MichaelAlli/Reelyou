import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  EMPTY_RELATE_WEAK_OBSERVATION_STATE,
  type RelateWeakObservation,
  type RelateWeakObservationState,
} from '@/skywrite/comments/relateWeakSignalLogic';

const STORAGE_KEY = '@reellyou/relate-weak-observations';

function parseObservation(raw: unknown): RelateWeakObservation | null {
  if (!raw || typeof raw !== 'object') return null;
  const entry = raw as Partial<RelateWeakObservation>;
  if (typeof entry.observationId !== 'string') return null;
  if (typeof entry.commentId !== 'string') return null;
  if (typeof entry.commenterId !== 'string') return null;
  if (typeof entry.skywriteId !== 'string') return null;
  if (typeof entry.createdAt !== 'number') return null;
  return {
    observationId: entry.observationId,
    commentId: entry.commentId,
    commenterId: entry.commenterId,
    skywriteId: entry.skywriteId,
    themeHint: typeof entry.themeHint === 'string' ? entry.themeHint : null,
    confidence: 'low',
    createdAt: entry.createdAt,
    updatedAt: typeof entry.updatedAt === 'number' ? entry.updatedAt : entry.createdAt,
    sourceSkywriteAllowAi: entry.sourceSkywriteAllowAi !== false,
  };
}

export function parseRelateWeakObservationState(raw: string | null): RelateWeakObservationState {
  if (!raw) return { ...EMPTY_RELATE_WEAK_OBSERVATION_STATE };
  try {
    const parsed = JSON.parse(raw) as Partial<RelateWeakObservationState>;
    const observations = Array.isArray(parsed.observations)
      ? parsed.observations
          .map(parseObservation)
          .filter((entry): entry is RelateWeakObservation => entry != null)
      : [];
    const processedCommentIds = Array.isArray(parsed.processedCommentIds)
      ? parsed.processedCommentIds.filter((id): id is string => typeof id === 'string')
      : [];
    return {
      observations,
      processedCommentIds,
      updatedAt: typeof parsed.updatedAt === 'number' ? parsed.updatedAt : 0,
    };
  } catch {
    return { ...EMPTY_RELATE_WEAK_OBSERVATION_STATE };
  }
}

export async function loadRelateWeakObservationState(): Promise<RelateWeakObservationState> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    return parseRelateWeakObservationState(raw);
  } catch {
    return { ...EMPTY_RELATE_WEAK_OBSERVATION_STATE };
  }
}

export async function saveRelateWeakObservationState(
  state: RelateWeakObservationState,
): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}
