import {
  addSkyFollowEdge,
  countSkyFriends,
  isMutualSkyFriends,
  removeSkyFollowEdge,
} from '@/social/skyFollow/skyFollowLogic';
import { EMPTY_SKY_FOLLOW_GRAPH } from '@/social/skyFollow/skyFollowTypes';

function assert(condition: boolean, message: string) {
  if (!condition) throw new Error(message);
}

const a = 'user-michael';
const b = 'orbit-jordan';

let graph = addSkyFollowEdge(EMPTY_SKY_FOLLOW_GRAPH, a, b, 1);
assert(!isMutualSkyFriends(graph, a, b), 'one-way not friends');

graph = addSkyFollowEdge(graph, b, a, 2);
assert(isMutualSkyFriends(graph, a, b), 'mutual friends');
assert(countSkyFriends(graph, a) === 1, 'count mutual');

graph = removeSkyFollowEdge(graph, a, b);
assert(!isMutualSkyFriends(graph, a, b), 'unfollow breaks mutual');
assert(countSkyFriends(graph, a) === 0, 'count zero');

console.log('skyFollowLogic.test.ts — OK');
