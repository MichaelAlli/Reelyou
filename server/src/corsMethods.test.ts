import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const indexSource = readFileSync(join(process.cwd(), 'src/index.ts'), 'utf8');

assert.match(
  indexSource,
  /Access-Control-Allow-Methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS'/,
  'Browser PUT (sky areas, onboarding, starpath) must be allowed for production web CORS',
);

console.log('[corsMethods.test] ok');
