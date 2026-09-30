import {
  buildRemoteAssetPlaceholderUri,
  parseRemoteAssetIdFromUri,
} from '@/social/sharedMediaConstants';

const id = 'asset-123';
const uri = buildRemoteAssetPlaceholderUri(id);
if (parseRemoteAssetIdFromUri(uri) !== id) {
  throw new Error('parseRemoteAssetIdFromUri failed');
}
console.log('sharedMediaConstants.test.ts — OK');
