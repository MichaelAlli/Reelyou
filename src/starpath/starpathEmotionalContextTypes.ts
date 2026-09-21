/** Support/context states — not diagnoses. */
export type UserSupportState =
  | 'calm'
  | 'energized'
  | 'uncertain'
  | 'overloaded'
  | 'reflective'
  | 'disengaged'
  | 'unknown';

export interface StarPathEmotionalContext {
  supportState: UserSupportState;
  /** User-reported phrase if provided (optional). */
  userReportedLabel?: string | null;
  updatedAt: number;
}

export const DEFAULT_EMOTIONAL_CONTEXT: StarPathEmotionalContext = {
  supportState: 'unknown',
  updatedAt: 0,
};
