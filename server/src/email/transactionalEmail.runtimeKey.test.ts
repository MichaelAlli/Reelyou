import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { RESEND_LIVE_SHAPED_TEST_KEY } from './testResendKeys.js';

const VALID_KEY = RESEND_LIVE_SHAPED_TEST_KEY;

process.env.AUTH_JWT_SECRET = 'test-jwt-secret-at-least-32-characters-long';
process.env.FRIEND_MATCH_PEPPER = 'test-friend-match-pepper-32-chars-min';
process.env.REELYOU_DB_PATH = join(mkdtempSync(join(tmpdir(), 'reellyou-tx-runtime-')), 'accounts.json');
process.env.EMAIL_FROM = 'Reelyou <support@forwardarcgroup.com>';
process.env.APP_ORIGIN = 'https://reelyou.onrender.com';
process.env.NODE_ENV = 'production';
process.env.RESEND_API_KEY = VALID_KEY;

const originalFetch = globalThis.fetch;

async function run() {
  let sawBefore = false;
  let authHeader = '';

  globalThis.fetch = (async (_url: string, init?: RequestInit) => {
    const headers = init?.headers as Record<string, string> | undefined;
    authHeader = headers?.Authorization ?? '';
    return new Response(JSON.stringify({ id: 'email_runtime_key' }), { status: 200 });
  }) as typeof fetch;

  const { config } = await import('../config.js');
  config.email.resendApiKey = '';

  const { sendTransactionalEmail } = await import('./transactionalEmail.js');
  const logs: string[] = [];
  const origLog = console.log;
  console.log = (...args: unknown[]) => {
    const line = args.map(String).join(' ');
    logs.push(line);
    if (line.includes('before-resend-request')) sawBefore = true;
    origLog(...args);
  };

  const result = await sendTransactionalEmail({
    to: 'user@example.com',
    subject: 'Reset',
    text: 'text',
  });

  console.log = origLog;
  assert.equal(result, 'sent');
  assert.equal(sawBefore, true);
  assert.equal(authHeader, 'Bearer ' + VALID_KEY);

  globalThis.fetch = originalFetch;
  rmSync(process.env.REELYOU_DB_PATH!, { force: true });
  console.log('transactionalEmail.runtimeKey.test.ts ok');
}

void run();
