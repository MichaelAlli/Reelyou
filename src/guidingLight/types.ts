/** Source of a Guiding Light signal — fixture for Beta, profile-derived later. */
export type GuidingLightSource = 'fixture' | 'profile';

/** Structured Guiding Light record — backend/AI-ready, local-first for Beta. */
export interface GuidingLightRecord {
  id: string | null;
  type: string | null;
  title: string | null;
  supportingText: string | null;
  source: GuidingLightSource | null;
  relatedEntityId: string | null;
  reasonCode: string | null;
  createdAt: string | null;
}

/** Persisted dismissal — user agency is authoritative. */
export interface GuidingLightDismissRecord {
  dismissedLightId: string | null;
  dismissedAt: string | null;
}

/** Home-ready view — at most one light, or a valid peace state. */
export interface GuidingLightHomeView {
  light: GuidingLightRecord | null;
  isPeaceState: boolean;
  /** User-visible explanation for “Why this?” — no hidden inference. */
  whyExplanation: string | null;
}

export const EMPTY_GUIDING_LIGHT_DISMISS: GuidingLightDismissRecord = {
  dismissedLightId: null,
  dismissedAt: null,
};
