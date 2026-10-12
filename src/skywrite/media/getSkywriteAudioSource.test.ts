import { buildRemoteAssetPlaceholderUri } from '@/social/sharedMediaConstants';
import {
  getSkywriteAudioSource,
  getSkywritePlayableAudioUri,
  mergeSkywriteAudioMedia,
  skywriteAudioNeedsRemoteResolve,
} from '@/skywrite/media/getSkywriteAudioSource';
import type { SkywriteRecord } from '@/skywrite/types';

const voicePost: SkywriteRecord = {
  id: 'a1',
  authorId: 'u1',
  text: '',
  textStyle: 'plain',
  mediaMode: 'voice',
  visibility: 'private',
  mood: null,
  showingUp: null,
  userHashtags: [],
  animateToSky: true,
  allowAIContext: true,
  createdAt: new Date().toISOString(),
  media: {
    photo: null,
    video: null,
    audio: {
      uri: buildRemoteAssetPlaceholderUri('aud-1'),
      remoteAssetId: 'aud-1',
      durationMs: 12000,
    },
    originalVideoAudio: 'off',
  },
};

if (!skywriteAudioNeedsRemoteResolve(voicePost)) {
  throw new Error('remote placeholder audio must require resolve');
}

const src = getSkywriteAudioSource(voicePost);
if (src.durationMs !== 12000 || !src.standalone) {
  throw new Error('getSkywriteAudioSource must expose duration and standalone flag');
}

if (getSkywritePlayableAudioUri(voicePost) !== null) {
  throw new Error('placeholder URI must not be playable until resolved');
}

const resolvedVoice: SkywriteRecord = {
  ...voicePost,
  media: {
    ...voicePost.media,
    audio: {
      uri: 'https://cdn.example/audio.m4a',
      remoteAssetId: 'aud-1',
      durationMs: 12000,
    },
  },
};
if (getSkywritePlayableAudioUri(resolvedVoice) !== 'https://cdn.example/audio.m4a') {
  throw new Error('resolved https audio must be playable');
}

const merged = mergeSkywriteAudioMedia(
  { uri: 'blob:local', durationMs: 8000 },
  { uri: buildRemoteAssetPlaceholderUri('aud-1'), remoteAssetId: 'aud-1' },
);
if (merged?.durationMs !== 8000) {
  throw new Error('merge must keep local duration when server lacks audioMeta');
}

console.log('getSkywriteAudioSource.test.ts — OK');
