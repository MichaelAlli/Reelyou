import type { ResolvedAppearance } from './types';

export interface TimeOfDaySchedule {
  /** Hour (0–23) when light theme begins. Default 7 = 7:00 AM. */
  lightStartHour: number;
  /** Hour (0–23) when dark theme begins. Default 19 = 7:00 PM. */
  darkStartHour: number;
}

export const DEFAULT_TIME_OF_DAY_SCHEDULE: TimeOfDaySchedule = {
  lightStartHour: 7,
  darkStartHour: 19,
};

export type TimeSource = () => Date;

/** Injectable clock for tests; production uses the device local time. */
export const defaultTimeSource: TimeSource = () => new Date();

/**
 * Light from 7:00 AM through 6:59 PM.
 * Dark from 7:00 PM through 6:59 AM.
 */
export function resolveTimeOfDayAppearance(
  date: Date,
  schedule: TimeOfDaySchedule = DEFAULT_TIME_OF_DAY_SCHEDULE,
): ResolvedAppearance {
  const minutes = date.getHours() * 60 + date.getMinutes();
  const lightStart = schedule.lightStartHour * 60;
  const darkStart = schedule.darkStartHour * 60;

  if (minutes >= lightStart && minutes < darkStart) {
    return 'light';
  }

  return 'dark';
}

/** Milliseconds until the next 7:00 AM or 7:00 PM local boundary. */
export function getMsUntilNextTimeBoundary(
  date: Date,
  schedule: TimeOfDaySchedule = DEFAULT_TIME_OF_DAY_SCHEDULE,
): number {
  const now = date.getTime();
  const candidates: number[] = [];

  for (let dayOffset = 0; dayOffset <= 1; dayOffset += 1) {
    const boundaryDate = new Date(date);
    boundaryDate.setDate(boundaryDate.getDate() + dayOffset);
    boundaryDate.setSeconds(0, 0);

    boundaryDate.setHours(schedule.lightStartHour, 0, 0, 0);
    candidates.push(boundaryDate.getTime());

    boundaryDate.setHours(schedule.darkStartHour, 0, 0, 0);
    candidates.push(boundaryDate.getTime());
  }

  const nextBoundary = candidates.filter((timestamp) => timestamp > now).sort((a, b) => a - b)[0];

  if (nextBoundary == null) {
    return 24 * 60 * 60 * 1000;
  }

  return Math.max(nextBoundary - now, 1000);
}
