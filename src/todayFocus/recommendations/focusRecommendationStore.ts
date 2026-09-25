import AsyncStorage from '@react-native-async-storage/async-storage';

import type {
  FocusRecommendation,
  FocusRecommendationSession,
} from '@/todayFocus/recommendations/focusRecommendationTypes';
import { focusTextFingerprint } from '@/todayFocus/recommendations/focusKeywordRelevance';

const STORAGE_KEY = '@reellyou/today-focus-recommendations';

export interface FocusRecommendationPersistedState {
  sessions: FocusRecommendationSession[];
  recommendations: FocusRecommendation[];
  dismissedKeys: string[];
  openedKeys: string[];
}

const EMPTY: FocusRecommendationPersistedState = {
  sessions: [],
  recommendations: [],
  dismissedKeys: [],
  openedKeys: [],
};

export async function loadFocusRecommendationState(): Promise<FocusRecommendationPersistedState> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY;
    const parsed = JSON.parse(raw) as FocusRecommendationPersistedState;
    return {
      sessions: Array.isArray(parsed.sessions) ? parsed.sessions : [],
      recommendations: Array.isArray(parsed.recommendations) ? parsed.recommendations : [],
      dismissedKeys: Array.isArray(parsed.dismissedKeys) ? parsed.dismissedKeys : [],
      openedKeys: Array.isArray(parsed.openedKeys) ? parsed.openedKeys : [],
    };
  } catch {
    return EMPTY;
  }
}

export async function saveFocusRecommendationState(
  state: FocusRecommendationPersistedState,
): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Non-blocking.
  }
}

export function findStableSession(
  state: FocusRecommendationPersistedState,
  focusId: string,
  focusFingerprint: string,
  generationToken: number,
): FocusRecommendationSession | undefined {
  return state.sessions.find(
    (session) =>
      session.focusId === focusId &&
      session.focusTextFingerprint === focusFingerprint &&
      session.status === 'active' &&
      (session.generationToken ?? 0) === generationToken,
  );
}

export function recommendationKey(rec: Pick<FocusRecommendation, 'type' | 'sourceId' | 'title'>): string {
  return `${rec.type}:${rec.sourceId ?? rec.title}`;
}

export function upsertRecommendationSession(
  state: FocusRecommendationPersistedState,
  session: FocusRecommendationSession,
  recommendations: FocusRecommendation[],
): FocusRecommendationPersistedState {
  const otherSessions = state.sessions.filter((entry) => entry.id !== session.id);
  const otherRecs = state.recommendations.filter(
    (entry) => !recommendations.some((rec) => rec.id === entry.id),
  );
  return {
    ...state,
    sessions: [...otherSessions, session],
    recommendations: [...otherRecs, ...recommendations],
  };
}

export function persistedStateEquals(
  a: FocusRecommendationPersistedState,
  b: FocusRecommendationPersistedState,
): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

export function markRecommendationDismissed(
  state: FocusRecommendationPersistedState,
  rec: FocusRecommendation,
  now = Date.now(),
): FocusRecommendationPersistedState {
  const key = recommendationKey(rec);
  return {
    ...state,
    dismissedKeys: state.dismissedKeys.includes(key) ? state.dismissedKeys : [...state.dismissedKeys, key],
    recommendations: state.recommendations.map((entry) =>
      entry.id === rec.id ? { ...entry, dismissedAt: now } : entry,
    ),
  };
}

export function markRecommendationOpened(
  state: FocusRecommendationPersistedState,
  rec: FocusRecommendation,
  now = Date.now(),
): FocusRecommendationPersistedState {
  const key = recommendationKey(rec);
  return {
    ...state,
    openedKeys: state.openedKeys.includes(key) ? state.openedKeys : [...state.openedKeys, key],
    recommendations: state.recommendations.map((entry) =>
      entry.id === rec.id ? { ...entry, openedAt: now } : entry,
    ),
  };
}

export function fingerprintForFocusText(text: string): string {
  return focusTextFingerprint(text);
}
