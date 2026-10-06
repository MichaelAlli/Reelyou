import assert from 'node:assert/strict';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

process.env.AUTH_JWT_SECRET = 'test-jwt-secret-at-least-32-characters-long';
process.env.FRIEND_MATCH_PEPPER = 'test-friend-match-pepper-32-chars-min';
process.env.REELYOU_DB_PATH = join(mkdtempSync(join(tmpdir(), 'reellyou-profile-')), 'accounts.json');

import { createUser } from './db/accountRepository.js';
import {
  getUserProfile,
  setUserOnboardingComplete,
  updateUserProfile,
} from './profile/userProfileRepository.js';

const user = createUser({
  email: `qa-profile-${Date.now()}@example.com`,
  password: 'TestPass123!',
  fullName: 'QA Profile',
});

assert.ok(user.id);
const profile = getUserProfile(user.id);
assert.equal(profile?.onboardingComplete, false);

const updated = updateUserProfile(user.id, { bio: 'North star text', username: 'qa_user' });
assert.equal(updated?.bio, 'North star text');
assert.equal(updated?.username, 'qa_user');

const onboarded = setUserOnboardingComplete(user.id, true, { steps: { profile: 'completed' } });
assert.equal(onboarded?.onboardingComplete, true);

console.log('[profileBackend.test] ok');
