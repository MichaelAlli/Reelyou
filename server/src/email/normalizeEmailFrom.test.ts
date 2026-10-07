import assert from 'node:assert/strict';

import {
  isResendApiKeyFormatValid,
  normalizeEmailFrom,
  normalizeResendApiKey,
  normalizeSecretEnv,
} from './normalizeEmailFrom.js';

function run() {
  const plain = normalizeEmailFrom('support@forwardarcgroup.com');
  assert.equal(plain.ok, true);
  if (plain.ok) {
    assert.equal(plain.value, 'support@forwardarcgroup.com');
    assert.equal(plain.domain, 'forwardarcgroup.com');
  }

  const named = normalizeEmailFrom('Reelyou <support@forwardarcgroup.com>');
  assert.equal(named.ok, true);
  if (named.ok) assert.equal(named.value, 'Reelyou <support@forwardarcgroup.com>');

  const bare = normalizeEmailFrom('<support@forwardarcgroup.com>');
  assert.equal(bare.ok, true);
  if (bare.ok) {
    assert.equal(bare.value, 'support@forwardarcgroup.com');
    assert.equal(bare.domain, 'forwardarcgroup.com');
  }

  const spaced = normalizeEmailFrom('  <support@forwardarcgroup.com>  ');
  assert.equal(spaced.ok, true);
  if (spaced.ok) assert.equal(spaced.value, 'support@forwardarcgroup.com');

  const quoted = normalizeEmailFrom('"Reelyou <support@forwardarcgroup.com>"');
  assert.equal(quoted.ok, true);

  assert.equal(normalizeEmailFrom('').ok, false);
  assert.equal(normalizeEmailFrom('   ').ok, false);
  assert.equal(normalizeEmailFrom('not-an-email').ok, false);
  assert.equal(normalizeEmailFrom('<bad').ok, false);

  assert.equal(normalizeSecretEnv('  re_abc  '), 're_abc');
  assert.equal(normalizeSecretEnv('"re_abc"'), 're_abc');
  assert.equal(normalizeSecretEnv('Bearer re_abc'), 're_abc');

  assert.equal(normalizeResendApiKey('re_abc123\n'), 're_abc123');
  assert.equal(normalizeResendApiKey('  re_abc123  '), 're_abc123');
  assert.equal(normalizeResendApiKey(' re_abc123 '), 're_abc123');
  assert.equal(normalizeResendApiKey('\r\nre_abc123\r\n'), 're_abc123');
  assert.equal(normalizeResendApiKey('   '), '');
  assert.equal(isResendApiKeyFormatValid(normalizeResendApiKey('   ')), false);
  assert.equal(isResendApiKeyFormatValid('re_test_key_123456789012345678901234'), true);
  assert.equal(isResendApiKeyFormatValid(''), false);
  assert.equal(isResendApiKeyFormatValid('not-a-key'), false);

  const reelyouFrom = normalizeEmailFrom('Reelyou <support@forwardarcgroup.com>');
  assert.equal(reelyouFrom.ok, true);
  if (reelyouFrom.ok) assert.equal(reelyouFrom.domain, 'forwardarcgroup.com');

  console.log('normalizeEmailFrom.test.ts ok');
}

run();
