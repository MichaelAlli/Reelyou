import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = join(process.cwd(), 'src');

function read(rel: string): string {
  return readFileSync(join(root, rel), 'utf8');
}

const token = read('constants/displayNameTypography.ts');
assert.match(token, /Fonts\.serif/, 'display name token uses approved serif');
assert.match(token, /fontWeight: '400'/);
assert.match(token, /letterSpacing: 0\.15/);

for (const file of [
  'components/skywrite/SkywriteSkyOwnerHeader.tsx',
  'components/profile/owner/OwnerProfileHero.tsx',
  'components/home/HomeArrivalHeader.tsx',
]) {
  assert.match(read(file), /reelyouDisplayNameTypography/, `${file} uses shared display name typography`);
}

console.log('displayNameTypography.test.ts ok');
