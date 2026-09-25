import {
  isEmergenceCredible,
  RUBRIC_WEIGHTS,
  scoreEmergingConstellation,
} from '@/emergingConstellations/emergingConstellationRubric';
import type { EmergingConstellationSignals } from '@/emergingConstellations/emergingConstellationTypes';

function assert(condition: boolean, message: string) {
  if (!condition) throw new Error(message);
}

const base: EmergingConstellationSignals = {
  likeHeartedness: 0.5,
  sharedSkyAreas: 0.5,
  repeatedPatterns: 0.5,
  compatibleNeeds: 0.5,
  livedExperience: 0.5,
  contributionBehavior: 0.5,
  starPathAlignment: 0.5,
  hashtagContext: 0.5,
};

const likeHeavy = { ...base, likeHeartedness: 0.95, hashtagContext: 0.1 };
const tagHeavy = { ...base, likeHeartedness: 0.2, hashtagContext: 0.95 };

assert(
  scoreEmergingConstellation(likeHeavy) > scoreEmergingConstellation(tagHeavy),
  'like-heartedness outweighs hashtags',
);
assert(RUBRIC_WEIGHTS.likeHeartedness > RUBRIC_WEIGHTS.hashtagContext, 'weight order');
assert(isEmergenceCredible(likeHeavy), 'credible when like-heartedness strong');

console.log('emergingConstellationRubric.test.ts — OK');
