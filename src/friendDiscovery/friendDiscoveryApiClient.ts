import { isReellyouBackendConfigured, resolveReellyouApiBaseUrl } from '@/backend/reellyouApiConfig';
import type { ContactMatchResult, FriendDiscoveryMatch } from '@/friendDiscovery/friendDiscoveryTypes';
import { runDevFixtureContactMatch } from '@/friendDiscovery/friendDiscoveryDevFixtures';

const MAX_IDENTIFIERS_PER_REQUEST = 150;

export async function postMatchContactIdentifiers(input: {
  viewerUserId: string;
  phones: readonly string[];
  emails: readonly string[];
  source: 'phone_contacts' | 'google_contacts';
}): Promise<ContactMatchResult> {
  const phones = input.phones.slice(0, MAX_IDENTIFIERS_PER_REQUEST);
  const emails = input.emails.slice(0, MAX_IDENTIFIERS_PER_REQUEST);

  if (
    __DEV__ &&
    process.env.EXPO_PUBLIC_FRIEND_DISCOVERY_DEV_FIXTURES === '1' &&
    !isReellyouBackendConfigured()
  ) {
    return runDevFixtureContactMatch({
      viewerUserId: input.viewerUserId,
      phones,
      emails,
      source: input.source,
    });
  }

  const base = resolveReellyouApiBaseUrl();
  if (!base) {
    return { status: 'backend_unconfigured', matches: [], message: 'Friend matching server is not configured.' };
  }

  try {
    const res = await fetch(`${base}/v1/friends/match-contacts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Reelyou-User-Id': input.viewerUserId,
      },
      body: JSON.stringify({
        phones,
        emails,
        source: input.source,
      }),
    });
    if (res.status === 429) {
      return { status: 'rate_limited', matches: [], message: 'Too many requests. Try again shortly.' };
    }
    if (!res.ok) {
      return { status: 'error', matches: [], message: 'Could not match contacts right now.' };
    }
    const body = (await res.json()) as {
      matches?: { userId: string; reason: string; reasonLabel: string }[];
    };
    const matches: FriendDiscoveryMatch[] = (body.matches ?? []).map((m) => ({
      userId: m.userId,
      reason: m.reason as FriendDiscoveryMatch['reason'],
      reasonLabel: m.reasonLabel,
    }));
    return matches.length
      ? { status: 'ok', matches }
      : { status: 'empty', matches: [], message: 'No discoverable matches yet.' };
  } catch {
    return { status: 'error', matches: [], message: 'Network error while matching contacts.' };
  }
}
