import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

process.env.AUTH_JWT_SECRET = 'test-jwt-secret-minimum-32-characters-long';
process.env.FRIEND_MATCH_PEPPER = 'test-friend-match-pepper-32chars-min';

const tmpDb = path.join(os.tmpdir(), `reellyou-swdel-${Date.now()}.json`);
process.env.REELYOU_DB_PATH = tmpDb;

const { resetAccountDatabaseForTests } = await import('../db/accountStore.js');
const { createUser } = await import('../db/accountRepository.js');
const {
  deleteSkywrite,
  getSkywriteForViewer,
  recoverSkywrite,
  processScheduledSkywritePurges,
} = await import('./socialRepository.js');
const { handleCreateSkywrite } = await import('./socialHandlers.js');
const { SKYWRITE_RECOVERY_WINDOW_MS } = await import('./skywriteDeletionConstants.js');

resetAccountDatabaseForTests(tmpDb);
const author = createUser({
  email: 'author@example.com',
  password: 'password123',
  fullName: 'Author',
  legalConsent: {
    termsVersion: '2026-10-01-beta-draft',
    privacyVersion: '2026-10-01-beta-draft',
    acceptedAt: Date.now(),
  },
});
const viewer = createUser({
  email: 'viewer@example.com',
  password: 'password123',
  fullName: 'Viewer',
  legalConsent: {
    termsVersion: '2026-10-01-beta-draft',
    privacyVersion: '2026-10-01-beta-draft',
    acceptedAt: Date.now(),
  },
});

const post = handleCreateSkywrite(author.id, { text: 'Recover me', visibility: 'public' });
assert.ok(post.ok);
const id = post.skywrite.id;

assert.ok(await deleteSkywrite(author.id, id));
assert.equal(getSkywriteForViewer(id, viewer.id), undefined);
assert.ok(getSkywriteForViewer(id, author.id));

assert.ok(recoverSkywrite(author.id, id));
assert.ok(getSkywriteForViewer(id, viewer.id));

assert.ok(await deleteSkywrite(author.id, id));
await processScheduledSkywritePurges(Date.now() + SKYWRITE_RECOVERY_WINDOW_MS + 1);
assert.equal(getSkywriteForViewer(id, author.id), undefined);

fs.unlinkSync(tmpDb);
console.log('skywriteDeletion tests ok');
