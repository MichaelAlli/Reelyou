import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

process.env.NODE_ENV = 'production';
process.env.AUTH_JWT_SECRET = 'test-jwt-secret-at-least-32-characters-long';
process.env.FRIEND_MATCH_PEPPER = 'test-friend-match-pepper-32-chars-min';
process.env.REELYOU_DB_PATH = join(mkdtempSync(join(tmpdir(), 'reellyou-email-prod-')), 'accounts.json');
process.env.RESEND_API_KEY = 're_test_key_123456789012345678901234\n';
process.env.EMAIL_FROM = 'Reelyou <support@forwardarcgroup.com>';
process.env.APP_ORIGIN = 'https://reelyou.onrender.com';
process.env.DATABASE_URL = '';
process.env.MEDIA_STORAGE = 'local';

const originalFetch = globalThis.fetch;

async function run() {
  let authHeader = '';
  globalThis.fetch = (async (_url: string, init?: RequestInit) => {
    const headers = init?.headers as Record<string, string> | undefined;
    authHeader = headers?.Authorization ?? '';
    return new Response(JSON.stringify({ id: 'email_123' }), { status: 200 });
  }) as typeof fetch;

  const { sendTransactionalEmail } = await import('./transactionalEmail.js');
  const result = await sendTransactionalEmail({
    to: 'user@example.com',
    subject: 'Reset',
    text: 'text',
    html: '<p>html</p>',
  });

  assert.equal(result, 'sent');
  assert.equal(authHeader, 'Bearer re_test_key_123456789012345678901234');

  globalThis.fetch = (async () =>
    new Response(
      JSON.stringify({ statusCode: 401, name: 'validation_error', message: 'API key is invalid' }),
      { status: 401 },
    )) as typeof fetch;

  const failed = await sendTransactionalEmail({
    to: 'user@example.com',
    subject: 'Reset',
    text: 'text',
  });
  assert.equal(failed, 'failed');

  globalThis.fetch = originalFetch;
  rmSync(process.env.REELYOU_DB_PATH!, { force: true });
  console.log('transactionalEmail.resend.test.ts ok');
}

void run();
