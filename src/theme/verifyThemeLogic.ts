import { resolveTimeOfDayAppearance, getMsUntilNextTimeBoundary } from './timeOfDay';
import { resolveAppearance } from './resolveAppearance';

interface VerificationCase {
  name: string;
  run: () => void;
}

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

const cases: VerificationCase[] = [
  {
    name: 'daytime uses light theme',
    run: () => {
      assert(resolveTimeOfDayAppearance(new Date(2026, 6, 19, 12, 0)) === 'light', 'noon should be light');
      assert(resolveTimeOfDayAppearance(new Date(2026, 6, 19, 7, 0)) === 'light', '7:00 AM should be light');
      assert(resolveTimeOfDayAppearance(new Date(2026, 6, 19, 18, 59)) === 'light', '6:59 PM should be light');
    },
  },
  {
    name: 'nighttime uses dark theme',
    run: () => {
      assert(resolveTimeOfDayAppearance(new Date(2026, 6, 19, 19, 0)) === 'dark', '7:00 PM should be dark');
      assert(resolveTimeOfDayAppearance(new Date(2026, 6, 19, 6, 59)) === 'dark', '6:59 AM should be dark');
      assert(resolveTimeOfDayAppearance(new Date(2026, 6, 19, 0, 0)) === 'dark', 'midnight should be dark');
    },
  },
  {
    name: 'next boundary is scheduled forward',
    run: () => {
      const noonDelay = getMsUntilNextTimeBoundary(new Date(2026, 6, 19, 12, 0));
      assert(noonDelay > 0, 'noon delay must be positive');
      assert(noonDelay <= 7 * 60 * 60 * 1000, 'noon should schedule before 7 PM');

      const midnightDelay = getMsUntilNextTimeBoundary(new Date(2026, 6, 19, 0, 0));
      assert(midnightDelay > 0, 'midnight delay must be positive');
      assert(midnightDelay <= 7 * 60 * 60 * 1000, 'midnight should schedule before 7 AM');
    },
  },
  {
    name: 'mode resolver respects manual and system settings',
    run: () => {
      assert(resolveAppearance('light', 'dark', new Date()) === 'light', 'manual light');
      assert(resolveAppearance('dark', 'light', new Date()) === 'dark', 'manual dark');
      assert(resolveAppearance('system', 'light', new Date()) === 'light', 'system light');
      assert(resolveAppearance('system', 'dark', new Date()) === 'dark', 'system dark');
      assert(
        resolveAppearance('timeOfDay', 'light', new Date(2026, 6, 19, 22, 0)) === 'dark',
        'time of day ignores system at night',
      );
    },
  },
];

export function runThemeLogicVerification(): { passed: number; failed: string[] } {
  const failed: string[] = [];

  for (const testCase of cases) {
    try {
      testCase.run();
    } catch (error) {
      failed.push(`${testCase.name}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  return { passed: cases.length - failed.length, failed };
}
