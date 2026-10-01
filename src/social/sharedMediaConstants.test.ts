import assert from 'node:assert/strict';

import { isEphemeralMediaUri } from '@/social/sharedMediaConstants';

assert.ok(isEphemeralMediaUri('blob:http://localhost/abc'));
assert.ok(isEphemeralMediaUri('data:image/png;base64,abc'));
assert.ok(!isEphemeralMediaUri('https://cdn.example/photo.jpg'));
assert.ok(!isEphemeralMediaUri('reelyou-asset://asset-1'));

console.log('sharedMediaConstants.test.ts — OK');
