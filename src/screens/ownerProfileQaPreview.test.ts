import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const source = readFileSync(join(process.cwd(), 'src/screens/OwnerProfileScreen.tsx'), 'utf8');

assert.match(source, /useQaPreviewMode/, 'Owner profile must read QA preview mode');
assert.match(
  source,
  /qaPreview\.active.*QA_OWNER_PROFILE_FIXTURE_ID/s,
  'QA gallery must use read-only owner fixture when unsigned',
);
assert.doesNotMatch(
  source,
  /if \(!ownerId\) \{\s*return <View style=\{styles\.root\} \/>;\s*\}/,
  'must not render empty black root when ownerId missing',
);

console.log('[ownerProfileQaPreview.test] ok');
