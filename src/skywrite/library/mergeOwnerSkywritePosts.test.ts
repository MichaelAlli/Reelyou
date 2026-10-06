import { buildRemoteAssetPlaceholderUri } from '@/social/sharedMediaConstants';
import { mergeOwnerSkywritePosts } from '@/skywrite/library/mergeOwnerSkywritePosts';
import type { SkywriteRecord } from '@/skywrite/types';

function videoPost(id: string, thumb?: string): SkywriteRecord {
  const videoAsset = `${id}-video`;
  const thumbAsset = thumb ?? undefined;
  return {
    id,
    authorId: 'user-1',
    text: 'clip',
    textStyle: 'plain',
    mediaMode: 'video',
    visibility: 'private',
    mood: null,
    showingUp: null,
    userHashtags: [],
    animateToSky: true,
    allowAIContext: true,
    createdAt: new Date().toISOString(),
    media: {
      photo: null,
      audio: null,
      video: {
        uri: buildRemoteAssetPlaceholderUri(videoAsset),
        remoteAssetId: videoAsset,
        thumbnailUri: thumbAsset ? buildRemoteAssetPlaceholderUri(thumbAsset) : undefined,
      },
      originalVideoAudio: 'off',
    },
  };
}

const localWithEphemeralThumb = videoPost('sw-1');
localWithEphemeralThumb.media.video!.thumbnailUri = 'blob:local-poster';

const remoteNoThumb = videoPost('sw-1');
remoteNoThumb.media.video!.thumbnailUri = undefined;

const merged = mergeOwnerSkywritePosts([localWithEphemeralThumb], [remoteNoThumb]);
const row = merged.find((p) => p.id === 'sw-1');
if (!row?.media.video?.thumbnailUri?.startsWith('blob:')) {
  throw new Error('merge must keep local ephemeral thumbnail when server row lacks thumbnailAssetId');
}

const remoteWithThumb = videoPost('sw-2', 'thumb-server');
const localOld = videoPost('sw-2', 'thumb-local');
const merged2 = mergeOwnerSkywritePosts([localOld], [remoteWithThumb]);
const row2 = merged2.find((p) => p.id === 'sw-2');
if (row2?.media.video?.thumbnailUri !== buildRemoteAssetPlaceholderUri('thumb-server')) {
  throw new Error('merge must prefer durable server thumbnail asset');
}

console.log('mergeOwnerSkywritePosts.test.ts — OK');
