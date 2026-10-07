import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

process.env.AUTH_JWT_SECRET = 'test-jwt-secret-at-least-32-characters-long';
process.env.FRIEND_MATCH_PEPPER = 'test-friend-match-pepper-32-chars-min';
process.env.REELYOU_DB_PATH = join(mkdtempSync(join(tmpdir(), 'reellyou-pw-resend-')), 'accounts.json');
process.env.RESEND_API_KEY = 're_test_key_123456789012345678901234';
process.env.EMAIL_FROM = '<support@forwardarcgroup.com>';
process.env.APP_ORIGIN = 'https://reelyou.onrender.com';

const originalFetch = globalThis.fetch;

async function run() {
  globalThis.fetch = (async () =>
    new Response(JSON.stringify({ id: 'sent-id' }), { status: 200 })) as typeof fetch;

  const { createUser } = await import('../db/accountRepository.js');
  const { requestPasswordReset } = await import('./passwordRecovery.js');

  const email = `resend.ok+${Date.now()}@example.com`;
  createUser({
    email,
    password: 'oldpassword1',
    fullName: 'Resend OK',
    phone: null,
    legalConsent: {
      termsVersion: 'beta-v1',
      privacyVersion: 'beta-v1',
      acceptedAt: Date.now(),
    },
  });

  const result = await requestPasswordReset(email);
  assert.equal(result.ok, true);
  if (result.ok) {
    assert.equal(result.accountFound, true);
    assert.equal(result.emailSent, true);
    assert.ok(result.maskedEmail.includes('@'));
  }

  const { loadAccountDatabase } = await import('../db/accountStore.js');
  const row = loadAccountDatabase().recoveryTokens?.find(
    (t) => t.purpose === 'password_reset' && t.usedAt == null,
  );
  assert.ok(row);

  globalThis.fetch = originalFetch;
  rmSync(process.env.REELYOU_DB_PATH!, { force: true });
  console.log('passwordRecovery.resend.test.ts ok');
}

void run();
