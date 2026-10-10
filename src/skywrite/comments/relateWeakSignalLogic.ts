import type { SkywriteCommentRecord } from '@/skywrite/comments/skywriteCommentTypes';
import type { SkywriteRecord } from '@/skywrite/types';

/** Minimum distinct submitted Relate comments before any optional pattern hint. */
export const MIN_RELATE_OBSERVATIONS_FOR_PATTERN = 3;

/** Observations older than this are ignored for aggregation. */
export const RELATE_OBSERVATION_TTL_MS = 1000 * 60 * 60 * 24 * 120;

export interface RelateWeakObservation {
  observationId: string;
  commentId: string;
  commenterId: string;
  skywriteId: string;
  /** Short phrase derived from the commenter's words — not copied from the post. */
  themeHint: string | null;
  confidence: 'low';
  createdAt: number;
  updatedAt: number;
  sourceSkywriteAllowAi: boolean;
}

export interface RelateWeakObservationState {
  observations: RelateWeakObservation[];
  processedCommentIds: string[];
  updatedAt: number;
}

export const EMPTY_RELATE_WEAK_OBSERVATION_STATE: RelateWeakObservationState = {
  observations: [],
  processedCommentIds: [],
  updatedAt: 0,
};

const STOP_WORDS = new Set([
  'a',
  'an',
  'the',
  'i',
  'i\'ve',
  'im',
  'i\'m',
  'also',
  'felt',
  'feel',
  'something',
  'similar',
  'too',
  'that',
  'this',
  'with',
  'and',
  'or',
  'to',
  'in',
  'on',
  'for',
  'of',
  'is',
  'was',
  'are',
  'be',
  'my',
  'me',
  'we',
  'you',
  'your',
]);

function nowMs(): number {
  return Date.now();
}

/** Derive a cautious theme hint from the commenter's own words only. */
export function deriveRelateThemeHintFromComment(body: string): string | null {
  const tokens = body
    .toLowerCase()
    .replace(/[^\w\s']/g, ' ')
    .split(/\s+/)
    .filter((word) => word.length > 2 && !STOP_WORDS.has(word));
  if (tokens.length < 2) return null;
  const unique = [...new Set(tokens)].slice(0, 4);
  return unique.join(' ');
}

export function buildRelateObservationFromComment(
  comment: SkywriteCommentRecord,
  skywrite: Pick<SkywriteRecord, 'id' | 'allowAIContext' | 'visibility'>,
): RelateWeakObservation | null {
  if (comment.starterKind !== 'relate') return null;
  if (skywrite.visibility === 'private') return null;
  if (skywrite.allowAIContext === false) return null;

  const themeHint = deriveRelateThemeHintFromComment(comment.body);
  const ts = nowMs();
  return {
    observationId: `rel-obs-${comment.commentId}`,
    commentId: comment.commentId,
    commenterId: comment.authorId,
    skywriteId: skywrite.id,
    themeHint,
    confidence: 'low',
    createdAt: ts,
    updatedAt: ts,
    sourceSkywriteAllowAi: skywrite.allowAIContext,
  };
}

export function upsertRelateObservation(
  state: RelateWeakObservationState,
  observation: RelateWeakObservation,
): RelateWeakObservationState {
  if (state.processedCommentIds.includes(observation.commentId)) {
    const observations = state.observations.map((entry) =>
      entry.commentId === observation.commentId ? observation : entry,
    );
    return { ...state, observations, updatedAt: nowMs() };
  }
  return {
    ...state,
    observations: [...state.observations, observation],
    processedCommentIds: [...state.processedCommentIds, observation.commentId],
    updatedAt: nowMs(),
  };
}

export function removeRelateObservationForComment(
  state: RelateWeakObservationState,
  commentId: string,
): RelateWeakObservationState {
  return {
    ...state,
    observations: state.observations.filter((entry) => entry.commentId !== commentId),
    processedCommentIds: state.processedCommentIds.filter((id) => id !== commentId),
    updatedAt: nowMs(),
  };
}

export function activeRelateObservationsForUser(
  state: RelateWeakObservationState,
  commenterId: string,
  now = nowMs(),
): RelateWeakObservation[] {
  return state.observations.filter(
    (entry) =>
      entry.commenterId === commenterId &&
      now - entry.createdAt <= RELATE_OBSERVATION_TTL_MS &&
      entry.sourceSkywriteAllowAi,
  );
}

/**
 * Optional broader pattern — requires multiple distinct Relate comments.
 * Never assigns goals, Sky areas, or needs.
 */
export function deriveOptionalRelatePatternHints(
  state: RelateWeakObservationState,
  commenterId: string,
): string[] {
  const active = activeRelateObservationsForUser(state, commenterId);
  const withHints = active.filter((entry) => entry.themeHint);
  const distinctPosts = new Set(withHints.map((entry) => entry.skywriteId));
  if (withHints.length < MIN_RELATE_OBSERVATIONS_FOR_PATTERN) return [];
  if (distinctPosts.size < 2) return [];

  const counts = new Map<string, number>();
  for (const entry of withHints) {
    const key = entry.themeHint!;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return [...counts.entries()]
    .filter(([, count]) => count >= 2)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .map(([hint]) => hint);
}
