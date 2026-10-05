import assert from 'node:assert/strict';

import {
  resolveStorySegmentCount,
  resolveStorySegmentIndex,
  uniqueSkywriteIdsInPlayOrder,
} from '@/skywrite/play/skywriteStorySegments';
import type { SkywritePlayStep } from '@/skywrite/play/skywritePlayTypes';
import { resolveFocusedSkyPlaySteps } from '@/skywrite/play/skywritePlayLogic';
import { registerPlaySkyPublication } from '@/skywrite/play/playSkySequenceEligibility';
import type { SkywriteRecord } from '@/skywrite/types';

const steps: SkywritePlayStep[] = [
  { stepId: 'text', skywriteId: 'a', kind: 'text' },
  { stepId: 'photo', skywriteId: 'a', kind: 'photo' },
  { stepId: 'text', skywriteId: 'b', kind: 'text' },
  { stepId: 'photo', skywriteId: 'c', kind: 'photo' },
];

assert.deepEqual(uniqueSkywriteIdsInPlayOrder(steps), ['a', 'b', 'c']);
assert.equal(resolveStorySegmentIndex(steps, 1), 0);
assert.equal(resolveStorySegmentIndex(steps, 2), 1);
assert.equal(resolveStorySegmentCount(steps), 3);

const now = Date.now();
const posts: SkywriteRecord[] = ['p1', 'p2', 'p3', 'p4', 'p5', 'p6'].map((id, i) => ({
  id,
  text: id,
  textStyle: 'classic',
  media: { photo: null, video: null, audio: null },
  mediaMode: 'text',
  visibility: 'private',
  mood: null,
  showingUp: null,
  userHashtags: [],
  animateToSky: false,
  allowAIContext: true,
  createdAt: new Date(now - i * 60_000).toISOString(),
}));

let registry = registerPlaySkyPublication({}, posts[0]!);
for (const post of posts.slice(1)) {
  registry = registerPlaySkyPublication(registry, post);
}
registry['p3']!.activeUntilMs = now - 1000;
registry['p4']!.activeUntilMs = now - 1000;
registry['p5']!.activeUntilMs = now - 1000;

const stars = posts.map((p) => ({
  type: 'skywrite' as const,
  sourceId: p.id,
  id: `star-${p.id}`,
  label: p.id,
  x: 0.5,
  y: 0.5,
}));

const filtered = resolveFocusedSkyPlaySteps(stars, posts, { orderedSkywriteIds: [], excludedSkywriteIds: [] }, {}, {
  playSkyRegistry: registry,
  nowMs: now,
});
const full = resolveFocusedSkyPlaySteps(stars, posts, { orderedSkywriteIds: [], excludedSkywriteIds: [] }, {}, {
  playSkyRegistry: registry,
  nowMs: now,
  retainExpiredInSequence: true,
});

assert.equal(filtered.length, 3, 'filtered drops expired skywrites from sequence');
assert.equal(full.length, 6, 'playback retains full order including expired');

console.log('skywriteStorySegments.test.ts — OK');
