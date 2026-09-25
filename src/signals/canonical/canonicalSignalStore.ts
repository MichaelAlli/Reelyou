import type {
  CanonicalSignalEvent,
  CanonicalSignalPreferenceContext,
  CanonicalSignalPresentation,
} from '@/signals/canonical/canonicalSignalModels';
import type {
  CanonicalSignalSignificance,
  CanonicalSignalSourceType,
  CanonicalSignalType,
  SignalPresentationStatus,
  SignalSurfaceEligibility,
} from '@/signals/canonical/canonicalSignalTypes';
import {
  signalPrivacyAllowsPresentation,
  type SignalPrivacyContext,
} from '@/signals/canonical/canonicalSignalPrivacy';

const DEFAULT_COOLDOWN_MS = 1000 * 60 * 60 * 24 * 3;

const COOLDOWN_BY_FAMILY: Partial<Record<CanonicalSignalType, number>> = {
  repeated_theme: 1000 * 60 * 60 * 24 * 7,
  connected_skies: 1000 * 60 * 60 * 24 * 14,
  reflection_return: 1000 * 60 * 60 * 24 * 14,
  saved_thread_return: 1000 * 60 * 60 * 24 * 10,
};

export interface EmitCanonicalSignalInput {
  userId: string;
  type: CanonicalSignalType;
  sourceType: CanonicalSignalSourceType;
  sourceId: string;
  dedupeKey: string;
  significanceLevel?: CanonicalSignalSignificance;
  privacyScope?: CanonicalSignalEvent['privacyScope'];
  relatedUserIds?: string[];
  relatedSkyAreaIds?: string[];
  relatedStarPathIds?: string[];
  provenanceIds?: string[];
  metadata?: Record<string, string | number | boolean | string[]>;
  expiresFromActivePresentationAt?: number;
  surfaceEligibility?: SignalSurfaceEligibility[];
  now?: number;
}

export interface CanonicalSignalStoreState {
  events: CanonicalSignalEvent[];
  presentations: CanonicalSignalPresentation[];
}

export function createCanonicalSignalStore(
  initial: CanonicalSignalStoreState = { events: [], presentations: [] },
) {
  let state = initial;

  function getState(): CanonicalSignalStoreState {
    return state;
  }

  function findRecentByDedupe(userId: string, dedupeKey: string, sinceMs: number, now: number) {
    return state.events.find(
      (event) =>
        event.userId === userId && event.dedupeKey === dedupeKey && event.createdAt >= now - sinceMs,
    );
  }

  function emit(input: EmitCanonicalSignalInput): CanonicalSignalEvent | null {
    const now = input.now ?? Date.now();
    const cooldown = COOLDOWN_BY_FAMILY[input.type] ?? DEFAULT_COOLDOWN_MS;
    if (findRecentByDedupe(input.userId, input.dedupeKey, cooldown, now)) {
      return null;
    }

    const event: CanonicalSignalEvent = {
      id: `cse-${input.type}-${now}-${state.events.length}`,
      userId: input.userId,
      type: input.type,
      sourceType: input.sourceType,
      sourceId: input.sourceId,
      relatedUserIds: input.relatedUserIds ?? [],
      relatedSkyAreaIds: input.relatedSkyAreaIds ?? [],
      relatedStarPathIds: input.relatedStarPathIds ?? [],
      createdAt: now,
      significanceLevel: input.significanceLevel ?? 'meaningful',
      privacyScope: input.privacyScope ?? 'owner_only',
      provenanceIds: input.provenanceIds ?? [],
      metadata: input.metadata ?? {},
      dedupeKey: input.dedupeKey,
      expiresFromActivePresentationAt: input.expiresFromActivePresentationAt,
    };

    state = {
      ...state,
      events: [...state.events, event],
      presentations: [
        ...state.presentations,
        {
          signalEventId: event.id,
          userId: input.userId,
          surfaceEligibility: input.surfaceEligibility ?? ['home'],
          status: 'active',
          firstShownAt: now,
        },
      ],
    };

    return event;
  }

  function coalesceSimilarApplications(
    userId: string,
    skyAreaId: string,
    windowMs: number,
    now: number,
  ): CanonicalSignalEvent | null {
    const recent = state.events.filter(
      (event) =>
        event.userId === userId &&
        event.type === 'application_moment' &&
        event.relatedSkyAreaIds.includes(skyAreaId) &&
        event.createdAt >= now - windowMs,
    );
    if (recent.length < 3) return null;
    return emit({
      userId,
      type: 'growth_momentum',
      sourceType: 'pattern',
      sourceId: `coalesce-app-${skyAreaId}`,
      dedupeKey: `growth_momentum:${skyAreaId}`,
      relatedSkyAreaIds: [skyAreaId],
      provenanceIds: recent.map((entry) => entry.id),
      metadata: { coalescedApplicationCount: recent.length },
      significanceLevel: 'strong',
    });
  }

  function setPresentationStatus(
    signalEventId: string,
    status: SignalPresentationStatus,
    now = Date.now(),
  ): void {
    state = {
      ...state,
      presentations: state.presentations.map((presentation) =>
        presentation.signalEventId === signalEventId
          ? {
              ...presentation,
              status,
              handledAt: status === 'handled' || status === 'dismissed' ? now : presentation.handledAt,
            }
          : presentation,
      ),
    };
  }

  function activePresentationsForUser(
    userId: string,
    prefs: CanonicalSignalPreferenceContext,
    privacy: SignalPrivacyContext,
    now = Date.now(),
  ): CanonicalSignalPresentation[] {
    if (prefs.quietMode) return [];

    const eventById = new Map(state.events.map((event) => [event.id, event]));

    return state.presentations.filter((presentation) => {
      if (presentation.userId !== userId) return false;
      if (presentation.status !== 'active' && presentation.status !== 'opened') return false;
      const event = eventById.get(presentation.signalEventId);
      if (!event) return false;
      if (prefs.mutedCategories?.[event.type]) return false;
      if (event.expiresFromActivePresentationAt && event.expiresFromActivePresentationAt < now) {
        return false;
      }
      return signalPrivacyAllowsPresentation(event, privacy);
    });
  }

  /** Dismiss/handle presentation only — canonical event remains in history. */
  function dismissPresentation(signalEventId: string, now = Date.now()) {
    setPresentationStatus(signalEventId, 'dismissed', now);
  }

  return {
    getState,
    emit,
    coalesceSimilarApplications,
    setPresentationStatus,
    dismissPresentation,
    activePresentationsForUser,
  };
}

export type CanonicalSignalStore = ReturnType<typeof createCanonicalSignalStore>;

/** Shared beta store — consumers read via hooks/providers in future tickets. */
export const canonicalSignalStore = createCanonicalSignalStore();
