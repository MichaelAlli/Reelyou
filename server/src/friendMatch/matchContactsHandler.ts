import type { IncomingMessage } from 'node:http';

import { matchContactIdentifiers, MAX_MATCH_IDENTIFIERS } from './discoverableDirectory.js';

export interface MatchContactsBody {
  phones?: string[];
  emails?: string[];
  source?: 'phone_contacts' | 'google_contacts';
}

export function resolveViewerUserId(req: IncomingMessage): string | null {
  const header = req.headers['x-reelyou-user-id'];
  const raw = Array.isArray(header) ? header[0] : header;
  const trimmed = raw?.trim();
  return trimmed || null;
}

export function handleMatchContacts(
  viewerUserId: string,
  body: MatchContactsBody,
): { matches: { userId: string; reason: string; reasonLabel: string }[] } {
  const phones = (body.phones ?? []).slice(0, MAX_MATCH_IDENTIFIERS);
  const emails = (body.emails ?? []).slice(0, MAX_MATCH_IDENTIFIERS);
  const source = body.source === 'google_contacts' ? 'google_contacts' : 'phone_contacts';

  const matches = matchContactIdentifiers({
    viewerUserId,
    phones,
    emails,
    source,
  });

  return { matches };
}
