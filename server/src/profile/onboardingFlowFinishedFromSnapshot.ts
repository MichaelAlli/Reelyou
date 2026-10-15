const ONBOARDING_STEP_IDS = [
  'profile',
  'goals',
  'challenges',
  'screen4',
  'whereYouLive',
  'findFamiliarSkies',
] as const;

/** True when persisted snapshot shows every onboarding step completed or skipped. */
export function onboardingFlowFinishedFromSnapshot(
  snapshot: Record<string, unknown> | null | undefined,
): boolean {
  if (!snapshot || typeof snapshot !== 'object') return false;
  if (snapshot.isOnboardingComplete === true) return true;
  const steps = snapshot.steps;
  if (!steps || typeof steps !== 'object') return false;
  const record = steps as Record<string, unknown>;
  return ONBOARDING_STEP_IDS.every((id) => {
    const status = record[id];
    return status === 'completed' || status === 'skipped';
  });
}
