import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

process.env.AUTH_JWT_SECRET = 'test-jwt-secret-minimum-32-characters-long';
process.env.FRIEND_MATCH_PEPPER = 'test-friend-match-pepper-32chars-min';

const tmpDb = path.join(os.tmpdir(), `reellyou-friend-prod-test-${Date.now()}.json`);
process.env.REELYOU_DB_PATH = tmpDb;

const { resetAccountDatabaseForTests, closeAccountDatabase } = await import('./db/accountStore.js');
const { handleRegister } = await import('./auth/authHandlers.js');
const { updateDiscoveryPreferences, blockUser } = await import('./db/accountRepository.js');
const { handleMatchContacts } = await import('./friendMatch/matchContactsService.js');
const { verifyAccessToken } = await import('./auth/jwt.js');

resetAccountDatabaseForTests(tmpDb);

const userA = handleRegister({
  email: 'alpha@reellyou.test',
  password: 'password-alpha',
  fullName: 'Alpha Tester',
  phone: '+14045559001',
});
const userB = handleRegister({
  email: 'beta@reellyou.test',
  password: 'password-beta',
  fullName: 'Beta Tester',
  phone: '+14045559002',
});
assert.ok(userA.ok && userB.ok);

updateDiscoveryPreferences(userA.user.id, { discoverableByEmail: true });
updateDiscoveryPreferences(userB.user.id, { discoverableByPhone: true, discoverableByEmail: true });

const matchAB = handleMatchContacts(userA.user.id, {
  phones: ['+14045559002'],
  emails: ['beta@reellyou.test'],
  source: 'phone_contacts',
});
assert.equal(matchAB.matches.length, 1);
assert.equal(matchAB.matches[0]?.userId, userB.user.id);

updateDiscoveryPreferences(userB.user.id, { discoverableByPhone: false, discoverableByEmail: false });
const noMatch = handleMatchContacts(userA.user.id, {
  phones: ['+14045559002'],
  emails: ['beta@reellyou.test'],
  source: 'phone_contacts',
});
assert.equal(noMatch.matches.length, 0);

blockUser(userA.user.id, userB.user.id);
updateDiscoveryPreferences(userB.user.id, { discoverableByEmail: true });
const blocked = handleMatchContacts(userA.user.id, {
  emails: ['beta@reellyou.test'],
  phones: [],
  source: 'phone_contacts',
});
assert.equal(blocked.matches.length, 0);

assert.equal(verifyAccessToken('not-a-token'), null);
assert.ok(userA.ok && verifyAccessToken(userA.accessToken)?.sub === userA.user.id);

closeAccountDatabase();
fs.unlinkSync(tmpDb);
console.log('friendDiscoveryProduction tests ok');
