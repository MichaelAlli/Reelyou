import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

process.env.AUTH_JWT_SECRET = 'test-jwt-secret-minimum-32-characters-long';
process.env.FRIEND_MATCH_PEPPER = 'test-friend-match-pepper-32chars-min';

const tmpDb = path.join(os.tmpdir(), `reellyou-journey-${Date.now()}.json`);
process.env.REELYOU_DB_PATH = tmpDb;

const { resetAccountDatabaseForTests, closeAccountDatabase } = await import('../db/accountStore.js');
const { registerWithLegalConsent } = await import('../test/registerWithLegalConsent.js');
const { handleCreateSkywrite, handleAddToYourJourney } = await import('../social/socialHandlers.js');
const {
  getPersonalJourney,
  updatePersonalJourney,
  normalizeJourneyTitle,
} = await import('./personalJourneyStore.js');

resetAccountDatabaseForTests(tmpDb);

const registered = registerWithLegalConsent({
  email: `journey-${Date.now()}@example.com`,
  password: 'password-aaaa',
  fullName: 'Michael Tester',
});
assert.ok(registered.ok);
const userId = registered.user.id;

const post = handleCreateSkywrite(userId, { text: 'Journey moment one', visibility: 'private' });
assert.ok(post.ok);
assert.ok(handleAddToYourJourney(userId, post.skywrite.id).ok);

assert.equal(normalizeJourneyTitle('  Becoming Me  '), 'Becoming Me');
assert.equal(getPersonalJourney(userId).orderedSkywriteIds.length, 0);

const ordered = updatePersonalJourney(userId, { orderedSkywriteIds: [post.skywrite.id] });
assert.ok(!('error' in ordered));
assert.deepEqual(getPersonalJourney(userId).orderedSkywriteIds, [post.skywrite.id]);

const titled = updatePersonalJourney(userId, { customTitle: 'My Acting Journey' });
assert.ok(!('error' in titled));
assert.equal(getPersonalJourney(userId).customTitle, 'My Acting Journey');

const badOrder = updatePersonalJourney(userId, { orderedSkywriteIds: ['not-a-real-id'] });
assert.equal(badOrder.error, 'invalid_order');

closeAccountDatabase();
fs.unlinkSync(tmpDb);
console.log('[personalJourneyBackend.test] ok');
