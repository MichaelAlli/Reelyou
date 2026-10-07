import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { RESEND_LIVE_SHAPED_TEST_KEY } from './testResendKeys.js';

const VALID_KEY = RESEND_LIVE_SHAPED_TEST_KEY;

process.env.AUTH_JWT_SECRET = 'test-jwt-secret-at-least-32-characters-long';
process.env.FRIEND_MATCH_PEPPER = 'test-friend-match-pepper-32-chars-min';
process.env.REELYOU_DB_PATH = join(mkdtempSync(join(tmpdir(), 'reellyou-runtime-email-')), 'accounts.json');
process.env.EMAIL_FROM = 'Reelyou <support@forwardarcgroup.com>';
process.env.APP_ORIGIN = 'https://reelyou.onrender.com';
process.env.NODE_ENV = 'production';
process.env.RESEND_API_KEY = VALID_KEY;

async function run() {
  const { effectiveResendApiKey } = await import('./runtimeEmailSecrets.js');
  const { config, refreshEmailSecretsFromEnv } = await import('../config.js');

  assert.equal(effectiveResendApiKey(''), VALID_KEY);

  config.email.resendApiKey = '';
  refreshEmailSecretsFromEnv();
  assert.equal(config.email.resendApiKey, VALID_KEY);
  assert.equal(effectiveResendApiKey(config.email.resendApiKey), VALID_KEY);

  const { selectTransactionalEmailProvider, passwordRecoveryEmailConfigured } = await import(
    './emailProvider.js'
  );
  assert.equal(selectTransactionalEmailProvider(config), 'resend');
  assert.equal(passwordRecoveryEmailConfigured(config), true);

  rmSync(process.env.REELYOU_DB_PATH!, { force: true });
  console.log('runtimeEmailSecrets.test.ts ok');
}

void run();
