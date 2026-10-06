import {
  EMPTY_ONBOARDING_STATE,
  type OnboardingState,
  type OnboardingStepId,
  type OnboardingStepStatus,
} from '@/onboarding/onboardingState';
import { readScopedJson, writeScopedJson } from '@/storage/scopedAsyncStorage';

const STORAGE_KEY = '@reellyou/onboarding-state';

const STEP_IDS: OnboardingStepId[] = [
  'profile',
  'goals',
  'challenges',
  'screen4',
  'whereYouLive',
  'findFamiliarSkies',
];

function isStepStatus(value: unknown): value is OnboardingStepStatus {
  return value === 'pending' || value === 'completed' || value === 'skipped';
}

function parseOnboardingState(raw: string | null): OnboardingState {
  if (!raw) return { ...EMPTY_ONBOARDING_STATE };
  try {
    const parsed = JSON.parse(raw) as Partial<OnboardingState>;
    const steps = { ...EMPTY_ONBOARDING_STATE.steps };
    if (parsed.steps && typeof parsed.steps === 'object') {
      for (const stepId of STEP_IDS) {
        const status = parsed.steps[stepId];
        if (isStepStatus(status)) steps[stepId] = status;
      }
    }
    return {
      ...EMPTY_ONBOARDING_STATE,
      interests: Array.isArray(parsed.interests) ? parsed.interests : [],
      goals: Array.isArray(parsed.goals) ? parsed.goals : [],
      challenges: Array.isArray(parsed.challenges) ? parsed.challenges : [],
      northStar:
        parsed.northStar && typeof parsed.northStar.originalVision === 'string'
          ? { originalVision: parsed.northStar.originalVision }
          : EMPTY_ONBOARDING_STATE.northStar,
      steps,
      aiPersonalizationEnabled:
        typeof parsed.aiPersonalizationEnabled === 'boolean'
          ? parsed.aiPersonalizationEnabled
          : EMPTY_ONBOARDING_STATE.aiPersonalizationEnabled,
      isOnboardingComplete: parsed.isOnboardingComplete === true,
    };
  } catch {
    return { ...EMPTY_ONBOARDING_STATE };
  }
}

export async function loadOnboardingState(): Promise<OnboardingState> {
  return readScopedJson(STORAGE_KEY, parseOnboardingState);
}

export async function saveOnboardingState(state: OnboardingState): Promise<boolean> {
  return writeScopedJson(STORAGE_KEY, state);
}
