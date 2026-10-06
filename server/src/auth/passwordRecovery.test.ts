import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

process.env.AUTH_JWT_SECRET = 'test-jwt-secret-at-least-32-characters-long';
process.env.FRIEND_MATCH_PEPPER = 'test-friend-match-pepper-32-chars-min';
process.env.REELYOU_DB_PATH = join(
  mkdtempSync(join(tmpdir(), 'reellyou-pw-recovery-')),
  'accounts.json',
);
process.env.RESEND_API_KEY = '';

import { createUser } from '../db/accountRepository.js';
import { resetPasswordWithToken, requestPasswordReset } from './passwordRecovery.js';
import { authenticateUser } from '../db/accountRepository.js';

async function run() {
  const email = `reset.test+${Date.now()}@example.com`;
  createUser({
    email,
    password: 'oldpassword1',
    fullName: 'Reset Test',
    phone: null,
    legalConsent: {
      termsVersion: 'beta-v1',
      privacyVersion: 'beta-v1',
      acceptedAt: Date.now(),
    },
  });

  const unknown = await requestPasswordReset('nobody@example.com');
  assert.equal(unknown.ok, true);
  if (unknown.ok) assert.equal(unknown.accountFound, false);

  const noEmailProvider = await requestPasswordReset(email);
  assert.equal(noEmailProvider.ok, false);
  if (!noEmailProvider.ok) assert.equal(noEmailProvider.error, 'email_delivery_failed');

  const { loadAccountDatabase } = await import('../db/accountStore.js');
  const tokenRow = loadAccountDatabase().recoveryTokens?.find(
    (t) => t.purpose === 'password_reset' && t.usedAt == null,
  );
  assert.ok(tokenRow);

  const fakeRaw = 'test-token-not-valid';
  const badReset = resetPasswordWithToken(fakeRaw, 'newpassword1');
  assert.equal(badReset.ok, false);

  assert.ok(authenticateUser(email, 'oldpassword1'));

  rmSync(process.env.REELYOU_DB_PATH!, { force: true });
  console.log('passwordRecovery.test.ts ok');
}

void run();
