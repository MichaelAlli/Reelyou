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

export function parseOnboardingState(raw: string | null): OnboardingState {
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

/** Restore goals and north star from server onboarding snapshot (cross-device). */
export function mergeOnboardingStateWithServerSnapshot(
  local: OnboardingState,
  snapshot: Record<string, unknown> | null | undefined,
): OnboardingState {
  if (!snapshot || typeof snapshot !== 'object') return local;
  let remote: OnboardingState;
  try {
    remote = parseOnboardingState(JSON.stringify(snapshot));
  } catch {
    return local;
  }
  return {
    ...local,
    interests: remote.interests.length > 0 ? remote.interests : local.interests,
    goals: remote.goals.length > 0 ? remote.goals : local.goals,
    challenges: remote.challenges.length > 0 ? remote.challenges : local.challenges,
    northStar: remote.northStar.originalVision.trim()
      ? remote.northStar
      : local.northStar,
    aiPersonalizationEnabled:
      remote.aiPersonalizationEnabled ?? local.aiPersonalizationEnabled,
    isOnboardingComplete: remote.isOnboardingComplete || local.isOnboardingComplete,
    steps: { ...local.steps, ...remote.steps },
  };
}
