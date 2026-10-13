import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

process.env.AUTH_JWT_SECRET = 'test-jwt-secret-minimum-32-characters-long';
process.env.FRIEND_MATCH_PEPPER = 'test-friend-match-pepper-32chars-min';

const tmpDb = path.join(os.tmpdir(), `reellyou-starpath-progress-${Date.now()}.json`);
process.env.REELYOU_DB_PATH = tmpDb;

const { resetAccountDatabaseForTests, closeAccountDatabase, loadAccountDatabase } = await import(
  '../db/accountStore.js'
);
const { registerWithLegalConsent } = await import('../test/registerWithLegalConsent.js');
const {
  handleGetStarpathProgress,
  handlePutStarpathProgress,
  handleGetJourneySignals,
} = await import('./starpathProgressHandlers.js');
const { createSkywrite } = await import('../social/socialRepository.js');

resetAccountDatabaseForTests(tmpDb);

const user = registerWithLegalConsent({
  email: `starpath-progress-${Date.now()}@example.com`,
  password: 'password-aaaa',
  fullName: 'StarPath Cloud',
});
assert.ok(user.ok);

const put = handlePutStarpathProgress(user.user.id, {
  resources: {
    savedResourceIds: ['opp-grant-1'],
    dismissedResourceIds: ['opp-stale-1'],
    snoozedResourceUntil: { 'opp-later-1': 1_700_000_000_000 },
  },
  settledMilestoneIds: ['milestone-a'],
  emotional: { supportState: 'reflective', userReportedLabel: null },
});
assert.equal(put.ok, true);
assert.deepEqual(put.snapshot.resources.savedResourceIds, ['opp-grant-1']);

const got = handleGetStarpathProgress(user.user.id);
assert.equal(got.ok, true);
assert.equal(got.snapshot.settledMilestoneIds[0], 'milestone-a');

createSkywrite(user.user.id, {
  text: 'I want to become a professional actor and need help finding representation.',
  visibility: 'public',
  allowAIContext: true,
  mediaMode: 'text',
});

createSkywrite(user.user.id, {
  text: 'Private diary entry',
  visibility: 'private',
  allowAIContext: true,
  mediaMode: 'text',
});

const db = loadAccountDatabase();
assert.ok((db.skywrites ?? []).length >= 2);

const signals = await handleGetJourneySignals(user.user.id);
assert.equal(signals.ok, true);
assert.ok(signals.sourceHash.length > 10);
assert.ok(['cache', 'unavailable', 'extracted'].includes(signals.source));

closeAccountDatabase();
fs.unlinkSync(tmpDb);

console.log('[starpathProgressBackend.test] ok');
