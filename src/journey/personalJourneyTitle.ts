const MAX_TITLE_LENGTH = 80;

export function sanitizeJourneyCustomTitle(raw: string): string {
  const trimmed = raw.replace(/[\r\n\t]/g, ' ').trim();
  if (!trimmed) return '';
  if (trimmed.length <= MAX_TITLE_LENGTH) return trimmed;
  return trimmed.slice(0, MAX_TITLE_LENGTH);
}

export function firstNameFromDisplayName(displayName: string | null | undefined): string | null {
  const trimmed = displayName?.trim();
  if (!trimmed) return null;
  const first = trimmed.split(/\s+/)[0]?.trim();
  return first || null;
}

/** User-facing Journey label on Skywrite (includes sparkle). */
export function formatPersonalJourneyDisplayTitle(input: {
  customTitle: string | null | undefined;
  displayName: string | null | undefined;
}): string {
  const custom = sanitizeJourneyCustomTitle(input.customTitle ?? '');
  if (custom) return `${custom} ✨`;
  const first = firstNameFromDisplayName(input.displayName);
  if (first) return `${first}'s Journey ✨`;
  return 'My Journey ✨';
}
