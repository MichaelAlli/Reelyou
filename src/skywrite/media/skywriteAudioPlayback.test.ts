import assert from 'node:assert/strict';

import { isLikelyLocalEphemeralAudioUri } from '@/skywrite/media/skywriteAudioUriUtils';

assert.equal(isLikelyLocalEphemeralAudioUri('blob:abc'), true);
assert.equal(isLikelyLocalEphemeralAudioUri('data:audio/webm;base64,xx'), true);
assert.equal(isLikelyLocalEphemeralAudioUri('https://cdn.example.com/a.webm'), false);
assert.equal(isLikelyLocalEphemeralAudioUri('reelyou-asset://audio/1'), false);

console.log('skywriteAudioPlayback.test.ts — OK');
