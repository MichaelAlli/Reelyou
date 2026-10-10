import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

process.env.AUTH_JWT_SECRET = 'test-jwt-secret-at-least-32-characters-long';
process.env.FRIEND_MATCH_PEPPER = 'test-friend-match-pepper-32-chars-min';
process.env.REELYOU_DB_PATH = join(mkdtempSync(join(tmpdir(), 'reellyou-health-')), 'accounts.json');
process.env.MEDIA_STORAGE = 's3';
process.env.MEDIA_S3_BUCKET = 'beta-bucket';
process.env.MEDIA_S3_ACCESS_KEY_ID = 'key';
process.env.MEDIA_S3_SECRET_ACCESS_KEY = 'secret';
process.env.MEDIA_S3_ENDPOINT = 'https://example.r2.cloudflarestorage.com';
process.env.RENDER_GIT_COMMIT = 'health-test-commit';

const { authConfigured, mediaStorageConfigured } = await import('./config.js');

assert.equal(authConfigured(), true);
assert.equal(mediaStorageConfigured(), true);

rmSync(process.env.REELYOU_DB_PATH!, { force: true });
console.log('healthPayload.test.ts ok');
