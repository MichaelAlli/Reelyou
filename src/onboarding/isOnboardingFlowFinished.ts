import { EMPTY_ONBOARDING_STATE, type OnboardingState } from '@/onboarding/onboardingState';

/** All approved onboarding steps resolved (completed or skipped). */
export function isOnboardingFlowFinished(
  state: Partial<Pick<OnboardingState, 'steps' | 'isOnboardingComplete'>>,
): boolean {
  if (state.isOnboardingComplete === true) return true;
  const steps = { ...EMPTY_ONBOARDING_STATE.steps, ...state.steps };
  const stepIds = Object.keys(EMPTY_ONBOARDING_STATE.steps) as (keyof OnboardingState['steps'])[];
  return stepIds.every((id) => {
    const status = steps[id];
    return status === 'completed' || status === 'skipped';
  });
}
