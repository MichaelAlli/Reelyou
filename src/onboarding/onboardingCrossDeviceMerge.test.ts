import {
  mergeOnboardingStateWithServerSnapshot,
  parseOnboardingState,
} from '@/onboarding/onboardingPersistence';
import { EMPTY_ONBOARDING_STATE } from '@/onboarding/onboardingState';

function assert(condition: boolean, message: string) {
  if (!condition) throw new Error(message);
}

const local = { ...EMPTY_ONBOARDING_STATE, goals: ['local-only'] };
const remoteSnapshot = {
  goals: ['Become a professional actor'],
  challenges: ['Confidence'],
  northStar: { originalVision: 'Perform on stage' },
  isOnboardingComplete: true,
};

const merged = mergeOnboardingStateWithServerSnapshot(local, remoteSnapshot);
assert(merged.goals[0] === 'Become a professional actor', 'server goals restore');
assert(merged.northStar.originalVision === 'Perform on stage', 'north star restore');

const emptyRemote = mergeOnboardingStateWithServerSnapshot(local, null);
assert(emptyRemote.goals[0] === 'local-only', 'null snapshot keeps local');

const parsed = parseOnboardingState(JSON.stringify(remoteSnapshot));
assert(parsed.challenges[0] === 'Confidence', 'parse export works');

console.log('[onboardingCrossDeviceMerge.test] ok');
