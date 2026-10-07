import assert from 'node:assert/strict';

import { parseCommaSeparatedSkyAreas } from '@/skyAreas/parseCommaSeparatedSkyAreas';

function run() {
  assert.deepEqual(parseCommaSeparatedSkyAreas('Dance, , Acting,   Music'), [
    'Dance',
    'Acting',
    'Music',
  ]);
  assert.deepEqual(parseCommaSeparatedSkyAreas('Dance, dance, DANCE'), ['Dance']);
  console.log('parseCommaSeparatedSkyAreas.test.ts ok');
}

run();
