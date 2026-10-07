import assert from 'node:assert/strict';

import {
  forgotPasswordTracePersistenceEnabled,
  loadForgotPasswordTrace,
  patchForgotPasswordTrace,
} from './forgotPasswordTrace.js';

async function run() {
  process.env.DATABASE_URL = '';
  assert.equal(forgotPasswordTracePersistenceEnabled(), false);

  const traceId = '00000000-0000-4000-8000-000000000001';
  await patchForgotPasswordTrace(traceId, { handlerEnteredAt: '2026-01-01T00:00:00.000Z' });
  const loaded = await loadForgotPasswordTrace(traceId);
  assert.equal(loaded, null);

  console.log('forgotPasswordTrace.test.ts ok');
}

void run();
