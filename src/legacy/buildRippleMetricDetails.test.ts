import { buildLegacyDemoMetricsState } from '@/legacy/legacyDemoFixtures';
import { buildRippleMetricDetailView } from '@/legacy/buildRippleMetricDetails';
import { currentUser } from '@/data/mockData';

function assert(condition: boolean, message: string) {
  if (!condition) throw new Error(message);
}

const metrics = buildLegacyDemoMetricsState();
const userDirectory = {
  [currentUser.id]: currentUser.name,
  'orbit-jordan': 'Jordan Lee',
  'orbit-1': 'Alex Kim',
};

const lives = buildRippleMetricDetailView({
  kind: 'lives',
  ownerUserId: currentUser.id,
  metrics,
  contributions: [],
  userDirectory,
  blockedUserIds: [],
});

assert(lives.rows.length >= 1, 'lives detail rows');
const uniquePeople = new Set(lives.rows.map((row) => row.personUserId));
assert(uniquePeople.size === lives.rows.length, 'one row per unique person');

console.log('buildRippleMetricDetails.test.ts — OK');
