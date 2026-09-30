import { authenticatedReellyouFetch } from '@/backend/authenticatedReellyouFetch';
import { isReellyouBackendConfigured } from '@/backend/reellyouApiConfig';
import type { ContactMatchResult, FriendDiscoveryMatch } from '@/friendDiscovery/friendDiscoveryTypes';
import { isFriendDiscoveryDevFixtureEnabled, isProductionFriendDiscoveryReady } from '@/config/betaReleaseFlags';
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

  if (isFriendDiscoveryDevFixtureEnabled() && !isProductionFriendDiscoveryReady()) {
    return runDevFixtureContactMatch({
      viewerUserId: input.viewerUserId,
      phones,
      emails,
      source: input.source,
    });
  }

  if (!isReellyouBackendConfigured()) {
    return { status: 'backend_unconfigured', matches: [], message: 'Friend matching server is not configured.' };
  }

  if (!isProductionFriendDiscoveryReady()) {
    return {
      status: 'error',
      matches: [],
      message: 'Sign in with a Reelyou account to use contact matching in beta.',
    };
  }

  try {
    const res = await authenticatedReellyouFetch('/v1/friends/match-contacts', {
      method: 'POST',
      body: JSON.stringify({
        phones,
        emails,
        source: input.source,
      }),
    });
    if (!res) {
      return { status: 'error', matches: [], message: 'Sign in required for contact matching.' };
    }
    if (res.status === 401) {
      return { status: 'error', matches: [], message: 'Session expired. Sign in again.' };
    }
    if (res.status === 429) {
      return { status: 'rate_limited', matches: [], message: 'Too many requests. Try again shortly.' };
    }
    if (res.status === 503) {
      return { status: 'backend_unconfigured', matches: [], message: 'Friend matching is not available yet.' };
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
