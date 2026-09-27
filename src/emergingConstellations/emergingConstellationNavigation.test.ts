import assert from 'node:assert/strict';

import { DEV_EMERGING_CONSTELLATION_ID } from '@/emergingConstellations/emergingConstellationFixtures';
import { listEligibleEmergingConstellations } from '@/emergingConstellations/listEligibleEmergingConstellations';
import { buildMySkyConstellationFormations } from '@/emergingConstellations/buildMySkyConstellationFormations';
import { listJoinedEmergingConstellations } from '@/emergingConstellations/listJoinedEmergingConstellations';
import { resolveEmergingConstellationRoute } from '@/emergingConstellations/resolveEmergingConstellationRoute';
import {
  devEmergingConstellationIfEligible,
  resolveEmergingConstellationById,
} from '@/emergingConstellations/emergingConstellationFixtures';
import {
  EMPTY_EMERGING_CONSTELLATIONS_STATE,
  mergeEmergingConstellationsPersistedState,
} from '@/emergingConstellations/emergingConstellationPersistence';

const canonical = devEmergingConstellationIfEligible();
assert.ok(canonical);

assert.equal(
  resolveEmergingConstellationRoute(canonical!.id, undefined),
  `/emerging-constellation/preview?id=${encodeURIComponent(canonical!.id)}`,
);

assert.equal(
  resolveEmergingConstellationRoute(canonical!.id, {
    communityId: canonical!.id,
    userId: 'u1',
    status: 'joined',
    role: 'member',
    joinedAt: Date.now(),
    notificationsMuted: false,
  }),
  `/emerging-constellation?id=${encodeURIComponent(canonical!.id)}`,
);

const listed = listEligibleEmergingConstellations(
  canonical,
  [
    {
      communityId: DEV_EMERGING_CONSTELLATION_ID,
      userId: 'u1',
      status: 'joined',
      role: 'member',
      joinedAt: Date.now(),
      notificationsMuted: false,
    },
  ],
  () => canonical,
);
assert.equal(listed.length, 1);
assert.equal(listed[0]?.id, DEV_EMERGING_CONSTELLATION_ID);

const joinedOnly = listJoinedEmergingConstellations(
  [
    {
      communityId: DEV_EMERGING_CONSTELLATION_ID,
      userId: 'u1',
      status: 'joined',
      role: 'member',
      joinedAt: Date.now(),
      notificationsMuted: false,
    },
  ],
  () => canonical,
);
assert.equal(joinedOnly.length, 1);

assert.ok(
  resolveEmergingConstellationById(DEV_EMERGING_CONSTELLATION_ID),
  'joined canonical id always resolves',
);

const merged = mergeEmergingConstellationsPersistedState(EMPTY_EMERGING_CONSTELLATIONS_STATE, {
  ...EMPTY_EMERGING_CONSTELLATIONS_STATE,
  memberships: [
    {
      communityId: DEV_EMERGING_CONSTELLATION_ID,
      userId: 'user-michael',
      status: 'joined',
      role: 'member',
      joinedAt: Date.now(),
      notificationsMuted: false,
    },
  ],
});
assert.equal(merged.memberships.length, 1);

const formations = buildMySkyConstellationFormations(
  canonical,
  [
    {
      communityId: DEV_EMERGING_CONSTELLATION_ID,
      userId: 'user-michael',
      status: 'joined',
      role: 'member',
      joinedAt: Date.now(),
      notificationsMuted: false,
    },
  ],
  () => canonical,
);
assert.equal(formations.length, 1);
assert.equal(formations[0]?.state, 'Joined');

console.log('emergingConstellationNavigation.test.ts — OK');
