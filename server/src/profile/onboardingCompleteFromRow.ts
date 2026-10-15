import type { StoredUser } from '../db/accountStore.js';
import { onboardingFlowFinishedFromSnapshot } from './onboardingFlowFinishedFromSnapshot.js';

/** Authoritative completion: row flag, snapshot flag, or all steps finished in snapshot. */
export function onboardingCompleteFromRow(row: StoredUser): boolean {
  if (row.onboardingComplete === true) return true;
  const snap = row.onboardingSnapshot;
  if (snap && typeof snap === 'object') {
    if ((snap as { isOnboardingComplete?: boolean }).isOnboardingComplete === true) return true;
    if (onboardingFlowFinishedFromSnapshot(snap)) return true;
  }
  return false;
}
