import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

process.env.AUTH_JWT_SECRET = 'test-jwt-secret-minimum-32-characters-long';

const tmpDb = path.join(os.tmpdir(), `reellyou-legal-reg-${Date.now()}.json`);
process.env.REELYOU_DB_PATH = tmpDb;

const { resetAccountDatabaseForTests } = await import('../db/accountStore.js');
const { handleRegister } = await import('./authHandlers.js');
const { loadAccountDatabase } = await import('../db/accountStore.js');

resetAccountDatabaseForTests(tmpDb);

const missing = handleRegister({
  email: 'no-terms@example.com',
  password: 'password123',
  fullName: 'No Terms',
});
assert.equal(missing.ok, false);

const ok = handleRegister({
  email: 'with-terms@example.com',
  password: 'password123',
  fullName: 'With Terms',
  termsAccepted: true,
  termsVersion: '2026-10-01-beta-draft',
  privacyVersion: '2026-10-01-beta-draft',
  consentAcceptedAt: 1_700_000_000_000,
});
assert.ok(ok.ok);

const row = loadAccountDatabase().users.find((u) => u.emailNormalized === 'with-terms@example.com');
assert.equal(row?.legalConsent?.termsVersion, '2026-10-01-beta-draft');
assert.equal(row?.legalConsent?.privacyVersion, '2026-10-01-beta-draft');

fs.unlinkSync(tmpDb);
console.log('legalConsentRegister tests ok');
