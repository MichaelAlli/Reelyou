import assert from 'node:assert/strict';

import { EMPTY_FRIEND_DISCOVERY_STATE } from './friendDiscoveryTypes.js';
import { buildPeopleYouMayKnowSuggestions, countMutualSkyConnections } from './peopleYouMayKnowService.js';
import { EMPTY_SKY_FOLLOW_GRAPH } from '@/social/skyFollow/skyFollowTypes';
import { addSkyFollowEdge } from '@/social/skyFollow/skyFollowLogic';

let graph = EMPTY_SKY_FOLLOW_GRAPH;
graph = addSkyFollowEdge(graph, 'user-michael', 'orbit-jordan');
graph = addSkyFollowEdge(graph, 'orbit-1', 'orbit-jordan');
graph = addSkyFollowEdge(graph, 'user-michael', 'orbit-1');

const mutual = countMutualSkyConnections(graph, 'user-michael', 'orbit-jordan');
assert.ok(mutual >= 0);

const suggestions = buildPeopleYouMayKnowSuggestions({
  viewerId: 'user-michael',
  graph,
  blockedUserIds: [],
  friendDiscovery: {
    ...EMPTY_FRIEND_DISCOVERY_STATE,
    contactMatchUserIds: ['orbit-2'],
  },
  reduceSuggestions: false,
});

assert.ok(suggestions.some((s) => s.userId === 'orbit-2'));
assert.ok(!suggestions.some((s) => s.userId === 'user-michael'));

const reduced = buildPeopleYouMayKnowSuggestions({
  viewerId: 'user-michael',
  graph,
  blockedUserIds: [],
  friendDiscovery: EMPTY_FRIEND_DISCOVERY_STATE,
  reduceSuggestions: true,
});
assert.equal(reduced.length, 0);

console.log('peopleYouMayKnowService ok');
