import { SKYWRITE_COMPOSE_REQUIRES_CANONICAL_BOTTOM_NAV } from '@/skywrite/skywriteComposerNavPolicy';

function assert(condition: boolean, message: string) {
  if (!condition) throw new Error(message);
}

assert(
  SKYWRITE_COMPOSE_REQUIRES_CANONICAL_BOTTOM_NAV === true,
  'Skywrite composer canonical bottom nav is a protected requirement',
);

console.log('skywriteComposerNavPolicy.test.ts — OK');
