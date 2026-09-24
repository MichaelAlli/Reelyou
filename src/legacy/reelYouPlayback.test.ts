import {
  buildLegacyDemoContributions,
  buildLegacyDemoLibraryState,
  buildLegacyDemoMetricsState,
  buildLegacyDemoSavedThreadsState,
  buildLegacyDemoSkywrites,
} from '@/legacy/legacyDemoFixtures';
import { buildLegacyMoments } from '@/legacy/buildLegacyMoments';
import { buildReelSequence } from '@/legacy/buildReelSequence';
import { buildSkywriteLifecycleView } from '@/skywrite/lifecycle/skywriteContentLifecycle';
import { EMPTY_LEGACY_USER_STATE } from '@/legacy/legacyMomentTypes';
import { reelSceneDurationMs, REEL_SCENE_MIN_MS } from '@/legacy/reelYouSceneDuration';

function assert(condition: boolean, message: string) {
  if (!condition) throw new Error(message);
}

const metrics = buildLegacyDemoMetricsState();
const library = buildLegacyDemoLibraryState();
const lifecycle = buildSkywriteLifecycleView(library);
const moments = buildLegacyMoments({
  ownerUserId: 'user-michael',
  metrics,
  contributions: buildLegacyDemoContributions(),
  reflections: buildLegacyDemoSavedThreadsState().reflections,
  lifecycle,
  skywrites: buildLegacyDemoSkywrites(),
  blockedUserIds: [],
  userState: EMPTY_LEGACY_USER_STATE,
  userDirectory: {
    'user-michael': 'Michael',
    'orbit-jordan': 'Jordan',
    'orbit-1': 'Alex',
    'sky-3': 'Priya',
  },
});

const reel = buildReelSequence({
  ownerUserId: 'user-michael',
  moments,
  now: moments[moments.length - 1]?.occurredAt ?? Date.now(),
});

assert(reel.momentIds.length > 1, 'demo reel has multiple scenes');
assert(reelSceneDurationMs(moments[0]) >= REEL_SCENE_MIN_MS, 'scene duration sane');

console.log(`reelYouPlayback.test.ts — OK (${reel.momentIds.length} scenes)`);
