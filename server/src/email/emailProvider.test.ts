import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { normalizeResendApiKey } from './normalizeEmailFrom.js';

const VALID_KEY = 're_test_key_123456789012345678901234';

type MockEmailSlice = {
  isProduction: boolean;
  appOrigin: string;
  email: {
    resendApiKey: string;
    smtpHost: string;
    smtpUser: string;
    smtpPass: string;
  };
};

function mockState(overrides: Partial<MockEmailSlice> & { email?: Partial<MockEmailSlice['email']> }): MockEmailSlice {
  return {
    isProduction: false,
    appOrigin: 'http://localhost:8081',
    email: {
      resendApiKey: '',
      smtpHost: '',
      smtpUser: '',
      smtpPass: '',
      ...overrides.email,
    },
    ...overrides,
  };
}

async function run() {
  assert.equal(normalizeResendApiKey(' key '), 'key');
  assert.equal(normalizeResendApiKey('key\n'), 'key');
  assert.equal(normalizeResendApiKey('\r\nkey\r\n'), 'key');
  assert.equal(normalizeResendApiKey('   '), '');

  process.env.AUTH_JWT_SECRET = 'test-jwt-secret-at-least-32-characters-long';
  process.env.FRIEND_MATCH_PEPPER = 'test-friend-match-pepper-32-chars-min';
  process.env.REELYOU_DB_PATH = join(mkdtempSync(join(tmpdir(), 'reellyou-email-prov-')), 'accounts.json');
  process.env.EMAIL_FROM = 'Reelyou <support@forwardarcgroup.com>';
  process.env.APP_ORIGIN = 'https://reelyou.onrender.com';
  process.env.NODE_ENV = 'production';
  process.env.RESEND_API_KEY = VALID_KEY;
  process.env.SMTP_HOST = 'smtp.example.com';
  process.env.SMTP_USER = 'smtp-user';
  process.env.SMTP_PASS = 'smtp-pass';

  const { config } = await import('../config.js');
  const {
    buildResendAuthorizationHeader,
    passwordRecoveryEmailConfigured,
    selectTransactionalEmailProvider,
  } = await import('./emailProvider.js');

  assert.equal(buildResendAuthorizationHeader('re_abc'), 'Bearer re_abc');
  assert.equal(
    buildResendAuthorizationHeader(normalizeResendApiKey('re_abc\n')),
    'Bearer re_abc',
  );

  const withResendAndSmtp = mockState({
    isProduction: true,
    email: {
      resendApiKey: VALID_KEY,
      smtpHost: 'smtp.example.com',
      smtpUser: 'user',
      smtpPass: 'pass',
    },
  });
  assert.equal(selectTransactionalEmailProvider(withResendAndSmtp as typeof config), 'resend');

  const prodNoResend = mockState({
    isProduction: true,
    email: {
      resendApiKey: '',
      smtpHost: 'smtp.example.com',
      smtpUser: 'user',
      smtpPass: 'pass',
    },
  });
  assert.equal(selectTransactionalEmailProvider(prodNoResend as typeof config), 'none');

  const devSmtpOnly = mockState({
    email: {
      resendApiKey: '',
      smtpHost: 'smtp.example.com',
      smtpUser: 'user',
      smtpPass: 'pass',
    },
  });
  assert.equal(selectTransactionalEmailProvider(devSmtpOnly as typeof config), 'smtp');

  assert.equal(selectTransactionalEmailProvider(config), 'resend');
  assert.equal(passwordRecoveryEmailConfigured(config), true);

  config.email.resendApiKey = '';
  assert.equal(selectTransactionalEmailProvider(config), 'none');
  assert.equal(passwordRecoveryEmailConfigured(config), false);

  rmSync(process.env.REELYOU_DB_PATH!, { force: true });
  console.log('emailProvider.test.ts ok');
}

void run();
