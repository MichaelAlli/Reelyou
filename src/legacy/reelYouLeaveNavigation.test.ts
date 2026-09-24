import { leaveReelYouRoute, LEGACY_CANONICAL_ROUTE } from '@/legacy/reelYouLeaveNavigation';

function assert(condition: boolean, message: string) {
  if (!condition) throw new Error(message);
}

function mockRouter(historyExists: boolean) {
  let backCalls = 0;
  let replaceArg: string | null = null;
  const router = {
    canGoBack: () => historyExists,
    back: () => {
      backCalls += 1;
    },
    replace: (href: string) => {
      replaceArg = href;
    },
  };
  return { router, get backCalls() { return backCalls; }, get replaceArg() { return replaceArg; } };
}

{
  const mock = mockRouter(true);
  leaveReelYouRoute(mock.router as never);
  assert(mock.backCalls === 1, 'expected back when history exists');
  assert(mock.replaceArg === null, 'expected no replace when history exists');
}

{
  const mock = mockRouter(false);
  leaveReelYouRoute(mock.router as never);
  assert(mock.backCalls === 0, 'expected no back without history');
  assert(mock.replaceArg === LEGACY_CANONICAL_ROUTE, 'expected legacy replace fallback');
}

console.log('reelYouLeaveNavigation.test.ts — OK');
