import { normalizeHashtagList, normalizeSkyAreaLabel } from '@/skyAreas/skyAreaNormalization';
import { addCustomSkyArea } from '@/skyAreas/skyAreaPreferencesLogic';
import { emptySkyAreaPreferences } from '@/skyAreas/skyAreaPreferencesTypes';
import { DEFAULT_SKY_AREAS } from '@/skyAreas/skyAreaDefinition';

function assert(condition: boolean, message: string) {
  if (!condition) throw new Error(message);
}

assert(normalizeSkyAreaLabel('Career Transition') === 'career transition', 'area normalize');
const tags = normalizeHashtagList(['#CareerChange', 'careerchange', '#CAREERCHANGE']);
assert(tags.length === 1 && tags[0]?.normalizedTag === 'careerchange', 'hashtag dedupe');
assert(
  normalizeHashtagList(['career-change'])[0]?.normalizedTag === 'career-change',
  'hyphen preserved',
);

let record = emptySkyAreaPreferences('user-michael');
const reused = addCustomSkyArea(record, 'Growth', DEFAULT_SKY_AREAS, []);
assert(reused.reused === true && reused.area?.id === 'growth', 'reuse default by label');

console.log('skyAreaNormalization.test.ts — OK');
