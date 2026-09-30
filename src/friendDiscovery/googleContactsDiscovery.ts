import * as WebBrowser from 'expo-web-browser';

import { postMatchContactIdentifiers } from '@/friendDiscovery/friendDiscoveryApiClient';
import type { ContactMatchResult } from '@/friendDiscovery/friendDiscoveryTypes';

WebBrowser.maybeCompleteAuthSession();

const GOOGLE_CONTACTS_SCOPE = 'https://www.googleapis.com/auth/contacts.readonly';

export function isGoogleContactsDiscoveryConfigured(): boolean {
  return Boolean(process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID?.trim());
}

export const GOOGLE_CONTACTS_BLOCKER =
  'Google Contacts discovery needs EXPO_PUBLIC_GOOGLE_CLIENT_ID and a Google Cloud OAuth client with the People API enabled. Sign-in and contact access are requested separately.';

/** Opens OAuth for contacts.readonly — separate from any Google sign-in used for auth. */
export async function authorizeGoogleContactsReadOnly(): Promise<
  'success' | 'cancelled' | 'unconfigured' | 'error'
> {
  if (!isGoogleContactsDiscoveryConfigured()) return 'unconfigured';
  // Full token exchange + People API pagination belongs in a native auth module once OAuth redirect URIs are registered.
  return 'error';
}

export async function syncGoogleContactsMatches(input: {
  viewerUserId: string;
  accessToken: string;
}): Promise<ContactMatchResult> {
  if (!input.accessToken.trim()) {
    return { status: 'error', matches: [], message: 'Google authorization expired. Connect again.' };
  }
  // People API fetch is implemented server-side or in a follow-up once OAuth returns tokens securely.
  void input;
  return {
    status: 'error',
    matches: [],
    message: 'Google Contacts sync is awaiting OAuth redirect configuration.',
  };
}

export function googleContactsScopeLabel(): string {
  return GOOGLE_CONTACTS_SCOPE;
}

export async function matchGoogleContactEmailsLocally(input: {
  viewerUserId: string;
  emails: readonly string[];
}): Promise<ContactMatchResult> {
  return postMatchContactIdentifiers({
    viewerUserId: input.viewerUserId,
    emails: input.emails,
    phones: [],
    source: 'google_contacts',
  });
}
