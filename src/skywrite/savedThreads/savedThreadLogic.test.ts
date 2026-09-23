import { EMPTY_SAVED_THREADS_STATE } from '@/skywrite/savedThreads/savedThreadTypes';
import {
  addThreadReflection,
  findSavedThread,
  saveSkywriteThread,
  unsaveThread,
} from '@/skywrite/savedThreads/savedThreadLogic';
import type { SkywriteRecord } from '@/skywrite/types';

function assert(condition: boolean, message: string) {
  if (!condition) throw new Error(message);
}

const skywrite: SkywriteRecord & { authorId: string } = {
  id: 'sw-test-save',
  authorId: 'orbit-jordan',
  text: 'Help with interviews',
  textStyle: 'plain',
  media: { photo: null, audio: null },
  mediaMode: 'text',
  visibility: 'public',
  mood: null,
  showingUp: null,
  userHashtags: [],
  animateToSky: false,
  allowAIContext: false,
  skyAreaId: 'career',
  createdAt: new Date().toISOString(),
};

function testSaveThread() {
  const first = saveSkywriteThread({
    state: EMPTY_SAVED_THREADS_STATE,
    ownerUserId: 'user-michael',
    skywrite,
  });
  assert(!first.duplicate, 'first save is new');
  assert(findSavedThread(first.state, 'user-michael', skywrite.id)?.status === 'active', 'active');

  const second = saveSkywriteThread({
    state: first.state,
    ownerUserId: 'user-michael',
    skywrite,
  });
  assert(second.duplicate, 'duplicate save blocked');
  assert(
    second.state.savedThreads.length === 1,
    'duplicate does not create second saved thread',
  );
}

function testReflectionsPersistOnUnsave() {
  const saved = saveSkywriteThread({
    state: EMPTY_SAVED_THREADS_STATE,
    ownerUserId: 'user-michael',
    skywrite,
  });
  const withReflection = addThreadReflection({
    state: saved.state,
    savedThreadId: saved.saved.savedThreadId,
    authorUserId: 'user-michael',
    body: 'This helped me breathe.',
  });
  const unsaved = unsaveThread(withReflection.state, saved.saved.savedThreadId);
  assert(unsaved.savedThreads.length === 0, 'unsaved removes saved thread row');
  assert(unsaved.reflections.length === 1, 'reflections kept by default');
}

testSaveThread();
testReflectionsPersistOnUnsave();
console.log('savedThreadLogic.test.ts — OK');
