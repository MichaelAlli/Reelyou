/** UI-only batch size — not a canonical queue cap. */
export const CONTRIBUTION_BEACON_BATCH_SIZE = 10;

export const BEACON_ACTIVE_LIFECYCLE_MS = 14 * 86400_000;

/** Rematch windows (deterministic Beta). */
export const BEACON_FIRST_REMATCH_DELAY_MS = 18 * 3600_000; // ~12–24h
export const BEACON_SECOND_REMATCH_DELAY_MS = 36 * 3600_000; // ~24–48h after first rematch
export const BEACON_LATER_REMATCH_DELAY_MS = 60 * 3600_000; // ~2–3 days

/** Max new recipient matches created per rematch wave (distribution, not product cap). */
export const BEACON_RECIPIENTS_PER_WAVE = 3;
