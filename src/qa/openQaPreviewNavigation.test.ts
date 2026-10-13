import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const hub = readFileSync(
  join(process.cwd(), 'src/components/qa/QaScreenGalleryHub.tsx'),
  'utf8',
);
assert.match(hub, /openQaPreviewNavigation/, 'gallery uses isolated splash navigation helper');

const routes = readFileSync(join(process.cwd(), 'src/qa/qaPreviewRoutes.ts'), 'utf8');
assert.match(routes, /href: '\/qa\/preview\/splash'/, 'splash catalog targets root preview route');

const nav = readFileSync(join(process.cwd(), 'src/qa/openQaPreviewNavigation.ts'), 'utf8');
assert.match(nav, /welcome/, 'welcome must use root-stack QA navigation');

console.log('openQaPreviewNavigation.test.ts ok');
