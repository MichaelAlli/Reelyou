import type { StoredUser } from '../db/accountStore.js';

/** Authoritative completion: row flag or persisted snapshot (cross-device). */
export function onboardingCompleteFromRow(row: StoredUser): boolean {
  if (row.onboardingComplete === true) return true;
  const snap = row.onboardingSnapshot;
  if (snap && typeof snap === 'object' && (snap as { isOnboardingComplete?: boolean }).isOnboardingComplete === true) {
    return true;
  }
  return false;
}
