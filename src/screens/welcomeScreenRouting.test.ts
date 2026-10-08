import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const welcome = readFileSync(join(process.cwd(), 'src/screens/WelcomeScreen.tsx'), 'utf8');
assert.match(welcome, /router\.push\('\/signup'/, 'Welcome primary CTA preserved');
assert.match(welcome, /router\.push\('\/login'/, 'Welcome Sign In preserved');
assert.match(welcome, /resolveWelcomeForegroundTop/, 'Welcome uses shared foreground layout');
assert.match(welcome, /resolveWelcomeLogoWidth/, 'Welcome uses responsive logo scale');
assert.match(welcome, /justifyContent: 'space-between'/, 'Welcome pushes CTA toward bottom');

console.log('welcomeScreenRouting.test.ts ok');
