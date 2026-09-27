import assert from 'node:assert/strict';

import { currentUser } from '@/data/mockData';
import { buildShareableVisitorProfileUrl } from '@/profile/visitorProfileRoute';

const url = buildShareableVisitorProfileUrl(currentUser.id);
assert.ok(url.includes('/visitor-profile'));
assert.ok(url.includes(encodeURIComponent(currentUser.id)));
assert.ok(!url.includes('preview=1'), 'share URL must be visitor-safe, not owner preview');

console.log('shareOwnerProfile.test.ts — OK');
