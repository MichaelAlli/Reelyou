import { buildLegacyDemoMetricsState } from '@/legacy/legacyDemoFixtures';
import {
  buildLegacyRippleViewModel,
  deriveEncouragementsGiven,
} from '@/legacy/buildLegacyRippleViewModel';
import { deriveLivesImpacted } from '@/humanPotential/humanPotentialMetricsEngine';
import { currentUser } from '@/data/mockData';

function assert(condition: boolean, message: string) {
  if (!condition) throw new Error(message);
}

const metrics = buildLegacyDemoMetricsState();
const userDirectory = {
  [currentUser.id]: currentUser.name,
  'orbit-jordan': 'Jordan',
  'orbit-1': 'Alex Kim',
  'sky-3': 'Priya Sharma',
};

const model = buildLegacyRippleViewModel({
  ownerUserId: currentUser.id,
  metrics,
  contributions: [],
  userDirectory,
  blockedUserIds: [],
});

assert(deriveLivesImpacted(currentUser.id, metrics) === model.heroMetrics[0]?.value, 'lives metric');
assert(
  deriveEncouragementsGiven(currentUser.id, metrics) === model.heroMetrics[2]?.value,
  'encouragements given metric',
);

const uniqueDirect = new Set(model.directNodes.map((node) => node.userId));
assert(uniqueDirect.size === model.directNodes.length, 'one node per unique person');

const directIds = new Set(model.directNodes.map((node) => node.userId));
for (const downstream of model.downstreamNodes) {
  assert(!directIds.has(downstream.userId), 'downstream must not duplicate direct nodes');
}

console.log('buildLegacyRippleViewModel.test.ts — OK');
