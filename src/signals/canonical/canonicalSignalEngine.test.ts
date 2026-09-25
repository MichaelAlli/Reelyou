import {
  emitApplicationMoment,
  emitConnectedSkiesSignal,
  emitGrowthMomentumSignal,
  emitRepeatedThemeSignal,
  emitRippleSignal,
} from '@/signals/canonical/canonicalSignalEmitters';
import { createCanonicalSignalStore } from '@/signals/canonical/canonicalSignalStore';

function assert(condition: boolean, message: string) {
  if (!condition) throw new Error(message);
}

function testDedupe() {
  const store = createCanonicalSignalStore();
  const first = emitRepeatedThemeSignal(store, 'user-michael', 'confidence', ['sw-1']);
  const second = emitRepeatedThemeSignal(store, 'user-michael', 'confidence', ['sw-2']);
  assert(Boolean(first), 'first emit');
  assert(second === null, 'dedupe second');
  assert(store.getState().events.length === 1, 'one event');
}

function testPresentationDismissPreservesEvent() {
  const store = createCanonicalSignalStore();
  const event = emitRippleSignal(store, 'user-michael', 'ripple-1');
  assert(Boolean(event), 'ripple event');
  if (!event) return;
  store.dismissPresentation(event.id);
  assert(store.getState().events.length === 1, 'event preserved');
  const presentation = store.getState().presentations.find((p) => p.signalEventId === event.id);
  assert(presentation?.status === 'dismissed', 'dismissed presentation');
}

function testCoalesceApplications() {
  const store = createCanonicalSignalStore();
  const now = Date.now();
  emitApplicationMoment(store, 'user-michael', 'app-1', 'career');
  emitApplicationMoment(store, 'user-michael', 'app-2', 'career');
  emitApplicationMoment(store, 'user-michael', 'app-3', 'career');
  const coalesced = store.coalesceSimilarApplications('user-michael', 'career', 1000 * 60 * 60 * 24 * 30, now + 1);
  assert(Boolean(coalesced), 'coalesced');
  if (coalesced) assert(coalesced.type === 'growth_momentum', 'growth momentum type');
}

function testConnectedSkiesDedupe() {
  const store = createCanonicalSignalStore();
  assert(Boolean(emitConnectedSkiesSignal(store, 'user-michael', 'orbit-jordan')), 'connected');
  assert(
    emitConnectedSkiesSignal(store, 'user-michael', 'orbit-jordan') === null,
    'connected dedupe',
  );
}

testDedupe();
testPresentationDismissPreservesEvent();
testCoalesceApplications();
testConnectedSkiesDedupe();

function testGrowthMomentumStarpathSurface() {
  const store = createCanonicalSignalStore();
  const event = emitGrowthMomentumSignal(store, 'user-michael', 'learning', ['p1'], {
    relatedStarPathNodeId: 'node-learning-1',
  });
  assert(Boolean(event), 'growth emit');
  const presentation = store.getState().presentations.find((p) => p.signalEventId === event?.id);
  assert(presentation?.surfaceEligibility.includes('starpath_internal'), 'starpath surface');
}

testGrowthMomentumStarpathSurface();

console.log('canonicalSignalEngine.test.ts — OK');
