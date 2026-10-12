import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

process.env.AUTH_JWT_SECRET = 'test-jwt-secret-minimum-32-characters-long';
process.env.FRIEND_MATCH_PEPPER = 'test-friend-match-pepper-32chars-min';

const tmpDb = path.join(os.tmpdir(), `reellyou-journey-iso-${Date.now()}.json`);
process.env.REELYOU_DB_PATH = tmpDb;

const { resetAccountDatabaseForTests, closeAccountDatabase } = await import('../db/accountStore.js');
const { registerWithLegalConsent } = await import('../test/registerWithLegalConsent.js');
const { handleCreateSkywrite, handleAddToYourJourney } = await import('../social/socialHandlers.js');
const { getPersonalJourney, updatePersonalJourney } = await import('./personalJourneyStore.js');

resetAccountDatabaseForTests(tmpDb);

const userA = registerWithLegalConsent({
  email: `journey-a-${Date.now()}@example.com`,
  password: 'password-aaaa',
  fullName: 'Actor A',
});
const userB = registerWithLegalConsent({
  email: `journey-b-${Date.now()}@example.com`,
  password: 'password-bbbb',
  fullName: 'Founder B',
});
assert.ok(userA.ok && userB.ok);

const postA = handleCreateSkywrite(userA.user.id, {
  text: 'Acting class notes',
  visibility: 'private',
});
assert.ok(postA.ok);
handleAddToYourJourney(userA.user.id, postA.skywrite.id);
updatePersonalJourney(userA.user.id, { customTitle: 'Actor Journey', orderedSkywriteIds: [postA.skywrite.id] });

const postB = handleCreateSkywrite(userB.user.id, {
  text: 'Startup milestone',
  visibility: 'public',
});
assert.ok(postB.ok);
handleAddToYourJourney(userB.user.id, postB.skywrite.id);
updatePersonalJourney(userB.user.id, { customTitle: 'Founder Journey', orderedSkywriteIds: [postB.skywrite.id] });

const journeyA = getPersonalJourney(userA.user.id);
const journeyB = getPersonalJourney(userB.user.id);

assert.equal(journeyA.customTitle, 'Actor Journey');
assert.equal(journeyB.customTitle, 'Founder Journey');
assert.deepEqual(journeyA.orderedSkywriteIds, [postA.skywrite.id]);
assert.deepEqual(journeyB.orderedSkywriteIds, [postB.skywrite.id]);
assert.notEqual(journeyA.orderedSkywriteIds[0], journeyB.orderedSkywriteIds[0]);

const badOrder = updatePersonalJourney(userB.user.id, { orderedSkywriteIds: [postA.skywrite.id] });
assert.equal(badOrder.error, 'invalid_order');

closeAccountDatabase();
fs.unlinkSync(tmpDb);
console.log('[journeyTwoAccountIsolation.test] ok');
