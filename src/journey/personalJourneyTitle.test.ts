import assert from 'node:assert/strict';

import { formatPersonalJourneyDisplayTitle } from '@/journey/personalJourneyTitle';

assert.equal(
  formatPersonalJourneyDisplayTitle({ customTitle: 'Becoming Me', displayName: 'Michael' }),
  'Becoming Me ✨',
);
assert.equal(
  formatPersonalJourneyDisplayTitle({ customTitle: null, displayName: 'Michael Alli' }),
  "Michael's Journey ✨",
);
assert.equal(
  formatPersonalJourneyDisplayTitle({ customTitle: null, displayName: '' }),
  'My Journey ✨',
);

console.log('[personalJourneyTitle.test] ok');
