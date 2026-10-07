import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const VALID_KEY = 're_test_key_123456789012345678901234';

process.env.AUTH_JWT_SECRET = 'test-jwt-secret-at-least-32-characters-long';
process.env.FRIEND_MATCH_PEPPER = 'test-friend-match-pepper-32-chars-min';
process.env.REELYOU_DB_PATH = join(mkdtempSync(join(tmpdir(), 'reellyou-email-diag-')), 'accounts.json');
process.env.EMAIL_FROM = 'Reelyou <support@forwardarcgroup.com>';
process.env.APP_ORIGIN = 'https://reelyou.onrender.com';
process.env.NODE_ENV = 'production';
process.env.RESEND_API_KEY = VALID_KEY;
process.env.RENDER_GIT_COMMIT = 'test-build-abc';

async function run() {
  const { buildEmailDiagnosticBody } = await import('./emailDiagnostic.js');
  const body = buildEmailDiagnosticBody();

  assert.equal(body.passwordForgotRouteRegistered, true);
  assert.equal(body.resendApiKeyPresent, true);
  assert.equal(body.emailFromPresent, true);
  assert.equal(body.appOriginPresent, true);
  assert.equal(body.authJwtSecretLengthValid, true);
  assert.equal(body.selectedProvider, 'resend');
  assert.equal(body.build, 'test-build-abc');
  assert.equal(typeof body.lastPasswordForgotAttempt, 'object');

  rmSync(process.env.REELYOU_DB_PATH!, { force: true });
  console.log('emailDiagnostic.test.ts ok');
}

void run();
