/** Default dwell for photo stories (~Instagram still duration). */
export const SKYREEL_STORY_PHOTO_DWELL_MS = 5000;

const SKYREEL_STORY_TEXT_MIN_MS = 4000;
const SKYREEL_STORY_TEXT_MAX_MS = 12000;
const SKYREEL_STORY_TEXT_MS_PER_CHAR = 45;

/** Readable text-story duration from content length. */
export function resolveSkyReelStoryStillDwellMs(
  stepKind: 'text' | 'photo',
  text?: string | null,
): number {
  if (stepKind === 'photo') return SKYREEL_STORY_PHOTO_DWELL_MS;
  const len = (text ?? '').trim().length;
  if (len <= 0) return SKYREEL_STORY_PHOTO_DWELL_MS;
  const estimated = len * SKYREEL_STORY_TEXT_MS_PER_CHAR;
  return Math.min(
    SKYREEL_STORY_TEXT_MAX_MS,
    Math.max(SKYREEL_STORY_TEXT_MIN_MS, estimated),
  );
}
