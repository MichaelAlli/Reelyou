import { OPPORTUNITY_ESCALATION } from '@/starpath/starpathResourceConfig';

export type InternalTimingState = 'normal' | 'approaching' | 'soon' | 'expiring';

export function internalTimingState(deadline: number, now: number): InternalTimingState {
  const remaining = deadline - now;
  if (remaining <= 0) return 'expiring';
  if (remaining <= OPPORTUNITY_ESCALATION.expiringDeadlineMs) return 'expiring';
  if (remaining <= OPPORTUNITY_ESCALATION.soonDeadlineMs) return 'soon';
  if (remaining <= OPPORTUNITY_ESCALATION.approachingDeadlineMs) return 'approaching';
  return 'normal';
}

export function calmDeadlinePhrase(deadline: number, now: number): string {
  const state = internalTimingState(deadline, now);
  switch (state) {
    case 'expiring':
      return 'Applications close soon.';
    case 'soon':
      return 'Registration ends this week.';
    case 'approaching':
      return 'There is an upcoming deadline worth noting.';
    default:
      return 'Deadline available on the official site.';
  }
}
