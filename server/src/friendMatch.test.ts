import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

process.env.AUTH_JWT_SECRET = 'test-jwt-secret-minimum-32-characters-long';
process.env.FRIEND_MATCH_PEPPER = 'test-friend-match-pepper-32chars-min';

const tmpDb = path.join(os.tmpdir(), `reellyou-friend-match-${Date.now()}.json`);
process.env.REELYOU_DB_PATH = tmpDb;

const { resetAccountDatabaseForTests, closeAccountDatabase } = await import('./db/accountStore.js');
const { handleRegister } = await import('./auth/authHandlers.js');
const { updateDiscoveryPreferences } = await import('./db/accountRepository.js');
const { handleMatchContacts } = await import('./friendMatch/matchContactsService.js');

resetAccountDatabaseForTests(tmpDb);

const viewer = handleRegister({
  email: 'viewer@reellyou.test',
  password: 'password-viewer',
  fullName: 'Viewer',
});
const target = handleRegister({
  email: 'target@reellyou.test',
  password: 'password-target',
  fullName: 'Target',
  phone: '+14045550101',
});
assert.ok(viewer.ok && target.ok);

updateDiscoveryPreferences(target.user.id, { discoverableByPhone: true });

const result = handleMatchContacts(viewer.user.id, {
  phones: ['+1 (404) 555-0101'],
  emails: [],
  source: 'phone_contacts',
});
assert.equal(result.matches.length, 1);
assert.equal(result.matches[0]?.userId, target.user.id);

const self = handleMatchContacts(target.user.id, {
  phones: ['+14045550101'],
  emails: [],
  source: 'phone_contacts',
});
assert.equal(self.matches.length, 0);

closeAccountDatabase();
fs.unlinkSync(tmpDb);
console.log('friendMatch tests ok');
