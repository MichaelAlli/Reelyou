import assert from 'node:assert/strict';

import { isGuidanceSlotActive, selectActiveGuidance } from '@/guidance/selectActiveGuidance';

const active = selectActiveGuidance([
  { id: 'my_sky_nav_overview', active: true },
  { id: 'my_sky_star_meaning', active: true },
  { id: 'my_sky_joined_groups_coachmark', active: true },
]);

assert.equal(active, 'my_sky_star_meaning');

assert.ok(
  !isGuidanceSlotActive('my_sky_constellations_coachmark', [
    { id: 'my_sky_nav_overview', active: true },
    { id: 'my_sky_constellations_coachmark', active: true },
  ]),
);

console.log('selectActiveGuidance.test.ts ok');
