import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

process.env.AUTH_JWT_SECRET = 'test-jwt-secret-minimum-32-characters-long';
process.env.FRIEND_MATCH_PEPPER = 'test-friend-match-pepper-32chars-min';

const tmpDb = path.join(os.tmpdir(), `reellyou-del-${Date.now()}.json`);
process.env.REELYOU_DB_PATH = tmpDb;

const { resetAccountDatabaseForTests } = await import('../db/accountStore.js');
const { createUser } = await import('../db/accountRepository.js');
const {
  cancelAccountDeletion,
  processScheduledAccountDeletions,
  requestAccountDeletion,
} = await import('./accountDeletion.js');
const { DELETION_CANCEL_WINDOW_MS, DELETION_PURGE_WINDOW_MS } = await import(
  './accountDeletionConstants.js'
);

resetAccountDatabaseForTests(tmpDb);
const user = createUser({
  email: 'delete-me@example.com',
  password: 'password123',
  fullName: 'Delete Me',
});

const req = requestAccountDeletion(user.id);
assert.equal(req.ok, true);
assert.equal(req.ok && req.status.deletionPending, true);

const cancel = cancelAccountDeletion(user.id);
assert.equal(cancel.ok, true);
assert.equal(cancel.ok && cancel.status.deletionPending, false);

requestAccountDeletion(user.id);
await processScheduledAccountDeletions(Date.now() + DELETION_CANCEL_WINDOW_MS + 1_000);
const { loadAccountDatabase } = await import('../db/accountStore.js');
let row = loadAccountDatabase().users.find((u) => u.id === user.id);
assert.ok(row?.deletedAt);

await processScheduledAccountDeletions(Date.now() + DELETION_PURGE_WINDOW_MS + 1_000);
row = loadAccountDatabase().users.find((u) => u.id === user.id);
assert.ok(row?.emailNormalized.startsWith('deleted+'));

fs.unlinkSync(tmpDb);
console.log('accountDeletion tests ok');
