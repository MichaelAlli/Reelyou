import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

process.env.AUTH_JWT_SECRET = 'test-jwt-secret-at-least-32-characters-long';
process.env.FRIEND_MATCH_PEPPER = 'test-friend-match-pepper-32-chars-min';
process.env.REELYOU_DB_PATH = join(mkdtempSync(join(tmpdir(), 'reellyou-email-')), 'accounts.json');
process.env.RESEND_API_KEY = 're_test_key_123456789012345678901234';
process.env.EMAIL_FROM = '<support@forwardarcgroup.com>';

const originalFetch = globalThis.fetch;

async function run() {
  let capturedBody: Record<string, unknown> | null = null;
  globalThis.fetch = (async (_url: string, init?: RequestInit) => {
    capturedBody = JSON.parse(String(init?.body)) as Record<string, unknown>;
    return new Response(JSON.stringify({ id: 'email_test_id' }), { status: 200 });
  }) as typeof fetch;

  const { sendTransactionalEmail } = await import('./transactionalEmail.js');

  const result = await sendTransactionalEmail({
    to: 'user@example.com',
    subject: 'Test',
    text: 'Hello',
    html: '<p>Hello</p>',
  });

  assert.equal(result, 'sent');
  assert.ok(capturedBody);
  assert.equal(capturedBody!.from, 'support@forwardarcgroup.com');
  assert.deepEqual(capturedBody!.to, ['user@example.com']);

  globalThis.fetch = (async () =>
    new Response(JSON.stringify({ name: 'validation_error', message: 'Invalid from' }), {
      status: 422,
    })) as typeof fetch;

  const failed = await sendTransactionalEmail({
    to: 'user@example.com',
    subject: 'Test',
    text: 'Hello',
  });
  assert.equal(failed, 'failed');

  globalThis.fetch = originalFetch;
  rmSync(process.env.REELYOU_DB_PATH!, { force: true });
  console.log('transactionalEmail.test.ts ok');
}

void run();
