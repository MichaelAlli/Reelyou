import type { ContactMatchResult } from '@/friendDiscovery/friendDiscoveryTypes';

/** Isolated dev-only matches — never shown in production builds. */
const FIXTURE_EMAIL_TO_USER: Record<string, string> = {
  'jordan.discoverable@reellyou.dev': 'orbit-jordan',
  'sarah.discoverable@reellyou.dev': 'orbit-1',
};

const FIXTURE_PHONE_TO_USER: Record<string, string> = {
  '+14045550101': 'orbit-jordan',
  '+14045550102': 'orbit-1',
};

export function runDevFixtureContactMatch(input: {
  viewerUserId: string;
  phones: readonly string[];
  emails: readonly string[];
  source: 'phone_contacts' | 'google_contacts';
}): ContactMatchResult {
  if (!__DEV__) {
    return { status: 'empty', matches: [] };
  }
  const reasonLabel =
    input.source === 'google_contacts' ? 'From Google Contacts' : 'From your contacts';
  const seen = new Set<string>();
  const matches = [];

  for (const email of input.emails) {
    const userId = FIXTURE_EMAIL_TO_USER[email];
    if (!userId || userId === input.viewerUserId || seen.has(userId)) continue;
    seen.add(userId);
    matches.push({
      userId,
      reason: input.source,
      reasonLabel,
    });
  }
  for (const phone of input.phones) {
    const userId = FIXTURE_PHONE_TO_USER[phone];
    if (!userId || userId === input.viewerUserId || seen.has(userId)) continue;
    seen.add(userId);
    matches.push({
      userId,
      reason: input.source,
      reasonLabel,
    });
  }

  return matches.length
    ? { status: 'ok', matches }
    : { status: 'empty', matches: [], message: 'No fixture matches for these identifiers.' };
}
