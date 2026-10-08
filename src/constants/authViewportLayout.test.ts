import assert from 'node:assert/strict';

import {
  AUTH_VIEWPORT_WIDTH_FALLBACK,
  isAuthCompactViewport,
  resolveAuthAvailableContentWidth,
} from './authViewportLayoutCore';

assert.equal(isAuthCompactViewport(844), true);
assert.equal(isAuthCompactViewport(932), true);
assert.equal(isAuthCompactViewport(960), false);

const available = resolveAuthAvailableContentWidth(0, 24);
assert.equal(available, AUTH_VIEWPORT_WIDTH_FALLBACK - 48);
assert.ok(Math.min(available, 300) > 120);

console.log('authViewportLayout tests ok');
