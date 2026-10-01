import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

process.env.AUTH_JWT_SECRET = 'test-jwt-secret-minimum-32-characters-long';
process.env.FRIEND_MATCH_PEPPER = 'test-friend-match-pepper-32chars-min';
process.env.MEDIA_STORAGE = 'local';

const tmpDb = path.join(os.tmpdir(), `reellyou-media-${Date.now()}.json`);
const tmpMedia = path.join(os.tmpdir(), `reellyou-media-root-${Date.now()}`);
process.env.REELYOU_DB_PATH = tmpDb;
process.env.MEDIA_LOCAL_ROOT = tmpMedia;

const { resetAccountDatabaseForTests, closeAccountDatabase } = await import('./db/accountStore.js');
const { registerWithLegalConsent } = await import('./test/registerWithLegalConsent.js');
const { handleCreateSkywrite } = await import('./social/socialHandlers.js');
const {
  handleCreateUploadSession,
  handleCompleteUploadSession,
  handleMediaAccess,
} = await import('./media/mediaHandlers.js');
const { writeLocalObject } = await import('./media/mediaStorage.js');
const { getMediaAsset } = await import('./media/mediaRepository.js');

resetAccountDatabaseForTests(tmpDb);

const author = registerWithLegalConsent({
  email: 'media-author@test.local',
  password: 'password-aaaa',
  fullName: 'Media Author',
});
const viewer = registerWithLegalConsent({
  email: 'media-viewer@test.local',
  password: 'password-bbbb',
  fullName: 'Media Viewer',
});
assert.ok(author.ok && viewer.ok);

const session = await handleCreateUploadSession(author.user.id, {
  kind: 'photo',
  contentType: 'image/jpeg',
  sizeBytes: 128,
});
assert.ok(session.ok);
const assetId = session.session.assetId;
const asset = getMediaAsset(assetId);
assert.ok(asset);
await writeLocalObject(asset!.storageKey, Buffer.from('fakejpeg'));
const complete = await handleCompleteUploadSession(author.user.id, assetId);
assert.ok(complete.ok);

const post = handleCreateSkywrite(author.user.id, {
  text: 'Photo post',
  visibility: 'public',
  mediaMode: 'photo',
  media: { photoAssetId: assetId },
});
assert.ok(post.ok);

const allowed = await handleMediaAccess(viewer.user.id, assetId);
assert.ok(allowed.ok && allowed.access.url);

closeAccountDatabase();
fs.rmSync(tmpMedia, { recursive: true, force: true });
fs.unlinkSync(tmpDb);
console.log('media tests ok');
