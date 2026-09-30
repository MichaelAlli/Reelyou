import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

process.env.AUTH_JWT_SECRET = 'test-jwt-secret-minimum-32-characters-long';
process.env.FRIEND_MATCH_PEPPER = 'test-friend-match-pepper-32chars-min';

const tmpDb = path.join(os.tmpdir(), `reellyou-social-${Date.now()}.json`);
process.env.REELYOU_DB_PATH = tmpDb;

const { resetAccountDatabaseForTests, closeAccountDatabase } = await import('./db/accountStore.js');
const { handleRegister } = await import('./auth/authHandlers.js');
const {
  handleFollow,
  handleGetSocialState,
  handleCreateSkywrite,
  handleAddComment,
  handleListComments,
  handleBlock,
} = await import('./social/socialHandlers.js');

resetAccountDatabaseForTests(tmpDb);

const a = handleRegister({
  email: 'social-a@test.local',
  password: 'password-aaaa',
  fullName: 'Social A',
});
const b = handleRegister({
  email: 'social-b@test.local',
  password: 'password-bbbb',
  fullName: 'Social B',
});
assert.ok(a.ok && b.ok);

assert.ok(handleFollow(a.user.id, b.user.id).ok);
const stateA = handleGetSocialState(a.user.id);
assert.deepEqual(stateA.followingUserIds, [b.user.id]);

const post = handleCreateSkywrite(a.user.id, { text: 'Hello shared sky', visibility: 'public' });
assert.ok(post.ok);
const comment = handleAddComment(b.user.id, post.skywrite.id, { text: 'Seen it' });
assert.ok(comment.ok);
assert.equal(handleListComments(post.skywrite.id).comments.length, 1);

handleBlock(a.user.id, b.user.id);
const blockedState = handleGetSocialState(a.user.id);
assert.ok(blockedState.blockedUserIds.includes(b.user.id));

closeAccountDatabase();
fs.unlinkSync(tmpDb);
console.log('social tests ok');
