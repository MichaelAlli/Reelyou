/** How the user chose their daily focus — user choice always outranks suggestion. */
export type TodayFocusSource = 'suggested' | 'custom';

/** AI-ready daily intention + reflection record — local-first, backend-handoff ready. */
export interface TodayFocusRecord {
  value: string | null;
  source: TodayFocusSource | null;
  /** Local calendar day key (YYYY-MM-DD) this focus applies to */
  dateKey: string | null;
  /** ISO timestamp when the user last selected/changed focus */
  selectedAt: string | null;
  /** User-authored reflection tied to the current focus for today */
  reflection: string | null;
  /** ISO timestamp when reflection was last saved */
  reflectionUpdatedAt: string | null;
}

export const EMPTY_TODAY_FOCUS: TodayFocusRecord = {
  value: null,
  source: null,
  dateKey: null,
  selectedAt: null,
  reflection: null,
  reflectionUpdatedAt: null,
};

export const MAX_TODAY_FOCUS_LENGTH = 120;
export const MAX_TODAY_FOCUS_REFLECTION_LENGTH = 500;
