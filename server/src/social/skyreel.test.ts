import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

process.env.AUTH_JWT_SECRET = 'test-jwt-secret-minimum-32-characters-long';
process.env.FRIEND_MATCH_PEPPER = 'test-friend-match-pepper-32chars-min';

const tmpDb = path.join(os.tmpdir(), `reellyou-skyreel-${Date.now()}.json`);
process.env.REELYOU_DB_PATH = tmpDb;

const { resetAccountDatabaseForTests } = await import('../db/accountStore.js');
const { createUser } = await import('../db/accountRepository.js');
const { handleCreateSkywrite } = await import('./socialHandlers.js');
const { isSkyreelActive, repostSkyreel } = await import('./socialRepository.js');
const { SKYREEL_WINDOW_MS } = await import('./skyreelConstants.js');

resetAccountDatabaseForTests(tmpDb);
const owner = createUser({
  email: 'owner@example.com',
  password: 'password123',
  fullName: 'Owner',
  legalConsent: {
    termsVersion: '2026-10-01-beta-draft',
    privacyVersion: '2026-10-01-beta-draft',
    acceptedAt: Date.now(),
  },
});
const other = createUser({
  email: 'other@example.com',
  password: 'password123',
  fullName: 'Other',
  legalConsent: {
    termsVersion: '2026-10-01-beta-draft',
    privacyVersion: '2026-10-01-beta-draft',
    acceptedAt: Date.now(),
  },
});

const post = handleCreateSkywrite(owner.id, { text: 'Skyreel me', visibility: 'public' });
assert.ok(post.ok);
const id = post.skywrite.id;
assert.ok(isSkyreelActive(post.skywrite));

assert.equal(repostSkyreel(other.id, id), null);
const reposted = repostSkyreel(owner.id, id, Date.now());
assert.ok(reposted);
const firstUntil = reposted!.skyreelActiveUntilMs!;

const refreshed = repostSkyreel(owner.id, id, Date.now() + 1000);
assert.ok(refreshed);
assert.ok(refreshed!.skyreelActiveUntilMs! >= firstUntil);

const expiredAt = refreshed!.skyreelRepostedAtMs! + SKYREEL_WINDOW_MS + 1;
assert.equal(isSkyreelActive(refreshed!, expiredAt), false);

fs.unlinkSync(tmpDb);
console.log('skyreel tests ok');
