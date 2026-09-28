import { publishSkywriteDraft } from '@/skywrite/publish/publishSkywriteDraft';
import { createEmptySkywriteDraft } from '@/skywrite/draft';

function assert(condition: boolean, message: string) {
  if (!condition) throw new Error(message);
}

void (async () => {
  const draft = createEmptySkywriteDraft();
  draft.text = 'Hello sky';

  const ok = await publishSkywriteDraft(draft, async () => true, 'user-michael');
  assert(ok.ok === true, 'persist success');
  if (ok.ok) {
    assert(ok.record.text === 'Hello sky', 'record text preserved');
    assert(typeof ok.saveMs === 'number', 'saveMs reported');
  }

  const fail = await publishSkywriteDraft(draft, async () => false, 'user-michael');
  assert(fail.ok === false, 'persist failure surfaces error');
  assert(typeof fail.saveMs === 'number', 'saveMs on failure');

  console.log('publishSkywriteDraft.test.ts — OK');
})();
