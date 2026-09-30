import assert from 'node:assert/strict';

import {
  normalizeEmailForMatch,
  normalizePhoneForMatch,
  extractEmailsFromContactFields,
} from './normalizeContactIdentifiers.js';

assert.equal(normalizeEmailForMatch('  Test@Example.COM '), 'test@example.com');
assert.equal(normalizeEmailForMatch('not-an-email'), null);
assert.equal(normalizePhoneForMatch('(404) 555-0101'), '+14045550101');
assert.deepEqual(
  extractEmailsFromContactFields([{ email: 'a@b.co' }, { email: 'bad' }]),
  ['a@b.co'],
);
console.log('normalizeContactIdentifiers ok');
