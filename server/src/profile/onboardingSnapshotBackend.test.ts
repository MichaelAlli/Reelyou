import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

process.env.AUTH_JWT_SECRET = 'test-jwt-secret-minimum-32-characters-long';
process.env.FRIEND_MATCH_PEPPER = 'test-friend-match-pepper-32chars-min';

const tmpDb = path.join(os.tmpdir(), `reellyou-onboarding-${Date.now()}.json`);
process.env.REELYOU_DB_PATH = tmpDb;

const { resetAccountDatabaseForTests, closeAccountDatabase } = await import('../db/accountStore.js');
const { registerWithLegalConsent } = await import('../test/registerWithLegalConsent.js');
const { handleGetOnboarding, handlePutOnboarding } = await import('./profileHandlers.js');

resetAccountDatabaseForTests(tmpDb);

const user = registerWithLegalConsent({
  email: `onboarding-${Date.now()}@example.com`,
  password: 'password-aaaa',
  fullName: 'Cross Device',
});
assert.ok(user.ok);

const put = handlePutOnboarding(user.user.id, {
  complete: true,
  snapshot: {
    goals: ['Acting'],
    northStar: { originalVision: 'Stage career' },
  },
});
assert.equal(put.ok, true);

const got = handleGetOnboarding(user.user.id);
assert.equal(got.ok, true);
assert.equal(got.complete, true);
assert.deepEqual(got.snapshot?.goals, ['Acting']);

const { loadAccountDatabase } = await import('../db/accountStore.js');
const db = loadAccountDatabase();
const row = db.users.find((u) => u.id === user.user.id);
assert.ok(row);
row!.onboardingComplete = false;
row!.onboardingSnapshot = { isOnboardingComplete: true, goals: ['Legacy flag mismatch'] };
const { handleGetOnboarding: getAgain } = await import('./profileHandlers.js');
const healed = getAgain(user.user.id);
assert.equal(healed.complete, true, 'GET /v1/onboarding/me honors snapshot.isOnboardingComplete');

closeAccountDatabase();
fs.unlinkSync(tmpDb);

console.log('[onboardingSnapshotBackend.test] ok');
