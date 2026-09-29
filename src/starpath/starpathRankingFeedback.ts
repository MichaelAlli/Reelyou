import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@reellyou/starpath-ranking-feedback';

export type RankingFeedbackKind = 'more_like' | 'less_like' | 'not_relevant' | 'correction';

export interface RankingFeedbackEntry {
  id: string;
  candidateId: string;
  kind: RankingFeedbackKind;
  /** Opportunity type or category fingerprint for decaying penalties. */
  fingerprint: string;
  createdAt: number;
  /** User correction text — explicit weight over inference. */
  correctionNote?: string;
}

export interface RankingFeedbackState {
  entries: RankingFeedbackEntry[];
}

const EMPTY: RankingFeedbackState = { entries: [] };

export async function loadRankingFeedback(): Promise<RankingFeedbackState> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY;
    const parsed = JSON.parse(raw) as RankingFeedbackState;
    if (!Array.isArray(parsed.entries)) return EMPTY;
    return parsed;
  } catch {
    return EMPTY;
  }
}

export async function saveRankingFeedback(state: RankingFeedbackState): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function fingerprintForCandidate(input: {
  opportunityType: string;
  categories: string[];
  provider: string;
}): string {
  return `${input.opportunityType}|${input.categories.slice(0, 2).join(',')}|${input.provider}`;
}

const DECAY_MS = 45 * 24 * 60 * 60 * 1000;

/** Penalty applied in deterministic sift — explicit corrections weigh heaviest. */
export function rankingPenaltyForCandidate(
  candidateId: string,
  fingerprint: string,
  state: RankingFeedbackState,
  now: number,
): number {
  let penalty = 0;
  for (const entry of state.entries) {
    const age = now - entry.createdAt;
    if (age > DECAY_MS) continue;
    const decay = 1 - age / DECAY_MS;
    if (entry.candidateId === candidateId) {
      if (entry.kind === 'correction') penalty += 1.2 * decay;
      if (entry.kind === 'less_like' || entry.kind === 'not_relevant') penalty += 0.85 * decay;
      if (entry.kind === 'more_like') penalty -= 0.35 * decay;
    } else if (entry.fingerprint === fingerprint) {
      if (entry.kind === 'less_like' || entry.kind === 'not_relevant') penalty += 0.45 * decay;
      if (entry.kind === 'more_like') penalty -= 0.2 * decay;
    }
  }
  return penalty;
}

export async function recordRankingFeedback(entry: Omit<RankingFeedbackEntry, 'id' | 'createdAt'>): Promise<void> {
  const state = await loadRankingFeedback();
  state.entries.push({
    ...entry,
    id: `rfb-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: Date.now(),
  });
  state.entries = state.entries.slice(-120);
  await saveRankingFeedback(state);
}
