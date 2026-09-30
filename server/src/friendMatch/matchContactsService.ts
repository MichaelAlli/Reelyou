import { areUsersBlocked, getUserById } from '../db/accountRepository.js';
import { loadAccountDatabase } from '../db/accountStore.js';
import { blindIndex } from './discoverabilityIndex.js';
import { normalizeEmail, normalizePhone } from './identifierNormalize.js';

export const MAX_MATCH_IDENTIFIERS = 150;

export interface MatchContactsBody {
  phones?: string[];
  emails?: string[];
  source?: 'phone_contacts' | 'google_contacts';
}

export function matchContactIdentifiers(input: {
  viewerUserId: string;
  phones: readonly string[];
  emails: readonly string[];
  source: 'phone_contacts' | 'google_contacts';
}): { userId: string; reason: string; reasonLabel: string }[] {
  if (!getUserById(input.viewerUserId)) return [];

  const db = loadAccountDatabase();
  const reasonLabel =
    input.source === 'google_contacts' ? 'From Google Contacts' : 'From your contacts';
  const seen = new Set<string>();
  const out: { userId: string; reason: string; reasonLabel: string }[] = [];

  for (const raw of input.phones) {
    const normalized = normalizePhone(raw);
    if (!normalized) continue;
    let hitUserId: string | undefined;
    try {
      hitUserId = db.phoneIndex[blindIndex(normalized)];
    } catch {
      return [];
    }
    if (!hitUserId || hitUserId === input.viewerUserId || seen.has(hitUserId)) continue;
    if (!getUserById(hitUserId)) continue;
    if (areUsersBlocked(input.viewerUserId, hitUserId)) continue;
    seen.add(hitUserId);
    out.push({ userId: hitUserId, reason: input.source, reasonLabel });
  }

  for (const raw of input.emails) {
    const normalized = normalizeEmail(raw);
    if (!normalized) continue;
    let hitUserId: string | undefined;
    try {
      hitUserId = db.emailIndex[blindIndex(normalized)];
    } catch {
      return [];
    }
    if (!hitUserId || hitUserId === input.viewerUserId || seen.has(hitUserId)) continue;
    if (!getUserById(hitUserId)) continue;
    if (areUsersBlocked(input.viewerUserId, hitUserId)) continue;
    seen.add(hitUserId);
    out.push({ userId: hitUserId, reason: input.source, reasonLabel });
  }

  return out;
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
