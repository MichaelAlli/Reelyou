import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const guard = readFileSync(join(process.cwd(), 'src/auth/PostWelcomeAuthGuard.tsx'), 'utf8');
assert.match(guard, /isQaPreviewQueryActive/, 'auth guard respects qaPreview query');
assert.match(guard, /qaBypass/, 'qa preview bypasses signed-out block');

console.log('postWelcomeAuthGuard.test.ts ok');
