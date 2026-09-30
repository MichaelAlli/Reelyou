import assert from 'node:assert/strict';

import { handleMatchContacts } from './friendMatch/matchContactsHandler.js';

function testMatchFixturePhone() {
  const result = handleMatchContacts('user-michael', {
    phones: ['+1 (404) 555-0101'],
    emails: [],
    source: 'phone_contacts',
  });
  assert.equal(result.matches.length, 1);
  assert.equal(result.matches[0]?.userId, 'orbit-jordan');
}

function testExcludesSelf() {
  const result = handleMatchContacts('orbit-jordan', {
    phones: ['+14045550101'],
    emails: [],
    source: 'phone_contacts',
  });
  assert.equal(result.matches.length, 0);
}

function testMatchFixtureEmail() {
  const result = handleMatchContacts('user-michael', {
    phones: [],
    emails: ['sarah.discoverable@reellyou.dev'],
    source: 'google_contacts',
  });
  assert.equal(result.matches.length, 1);
  assert.equal(result.matches[0]?.userId, 'orbit-1');
  assert.equal(result.matches[0]?.reasonLabel, 'From Google Contacts');
}

testMatchFixturePhone();
testExcludesSelf();
testMatchFixtureEmail();
console.log('friendMatch tests ok');
