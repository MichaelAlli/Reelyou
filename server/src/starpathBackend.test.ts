import assert from 'node:assert/strict';
import { discoverLiveResources } from './discoverResources.js';

async function testDiscoverArxivOrEmpty() {
  const result = await discoverLiveResources({
    keywordHints: ['learning'],
    todayFocusText: 'study habits',
    now: Date.now(),
  });
  assert.ok(['live', 'cached', 'degraded', 'empty'].includes(result.providerStatus));
  assert.ok(typeof result.checkedAt === 'number');
  for (const c of result.candidates) {
    assert.equal(c.fixtureOnly, false);
    assert.ok(c.officialUrl?.startsWith('http'));
    assert.ok(c.lastVerifiedAt);
  }
  console.log('discoverLiveResources', result.providerStatus, 'count', result.candidates.length);
}

testDiscoverArxivOrEmpty().catch((err) => {
  console.error(err);
  process.exit(1);
});
