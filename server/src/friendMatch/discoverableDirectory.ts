import { createHmac } from 'node:crypto';

import { normalizeEmail, normalizePhone } from './identifierNormalize.js';

export interface DiscoverableMember {
  userId: string;
  username?: string;
  discoverableByPhone: boolean;
  discoverableByEmail: boolean;
}

/** Dev directory — production replaces with verified credential store. */
const MEMBERS: DiscoverableMember[] = [
  {
    userId: 'orbit-jordan',
    username: 'jordan',
    discoverableByPhone: true,
    discoverableByEmail: true,
  },
  {
    userId: 'orbit-1',
    username: 'sarahchen',
    discoverableByPhone: true,
    discoverableByEmail: true,
  },
  {
    userId: 'orbit-2',
    username: 'davidok',
    discoverableByPhone: false,
    discoverableByEmail: true,
  },
];

/** Plaintext fixtures hashed at startup — never log or return these values. */
const VERIFIED_CREDENTIALS: { userId: string; phones: string[]; emails: string[] }[] = [
  {
    userId: 'orbit-jordan',
    phones: ['+14045550101'],
    emails: ['jordan.discoverable@reellyou.dev'],
  },
  {
    userId: 'orbit-1',
    phones: ['+14045550102'],
    emails: ['sarah.discoverable@reellyou.dev'],
  },
  {
    userId: 'orbit-2',
    phones: [],
    emails: ['david.discoverable@reellyou.dev'],
  },
];

function pepper(): string {
  return process.env.FRIEND_MATCH_PEPPER?.trim() || 'reellyou-dev-pepper-not-for-production';
}

function blindIndex(value: string): string {
  return createHmac('sha256', pepper()).update(value).digest('hex');
}

type IndexEntry = { userId: string; kind: 'phone' | 'email' };

const phoneIndex = new Map<string, IndexEntry>();
const emailIndex = new Map<string, IndexEntry>();

function memberFor(userId: string): DiscoverableMember | undefined {
  return MEMBERS.find((m) => m.userId === userId);
}

for (const row of VERIFIED_CREDENTIALS) {
  const member = memberFor(row.userId);
  if (!member) continue;
  for (const p of row.phones) {
    const n = normalizePhone(p);
    if (n && member.discoverableByPhone) phoneIndex.set(blindIndex(n), { userId: row.userId, kind: 'phone' });
  }
  for (const e of row.emails) {
    const n = normalizeEmail(e);
    if (n && member.discoverableByEmail) emailIndex.set(blindIndex(n), { userId: row.userId, kind: 'email' });
  }
}

export function matchContactIdentifiers(input: {
  viewerUserId: string;
  phones: readonly string[];
  emails: readonly string[];
  source: 'phone_contacts' | 'google_contacts';
}): { userId: string; reason: string; reasonLabel: string }[] {
  const seen = new Set<string>();
  const out: { userId: string; reason: string; reasonLabel: string }[] = [];
  const reasonLabel =
    input.source === 'google_contacts' ? 'From Google Contacts' : 'From your contacts';

  for (const raw of input.phones) {
    const normalized = normalizePhone(raw);
    if (!normalized) continue;
    const hit = phoneIndex.get(blindIndex(normalized));
    if (!hit || hit.userId === input.viewerUserId || seen.has(hit.userId)) continue;
    seen.add(hit.userId);
    out.push({ userId: hit.userId, reason: input.source, reasonLabel });
  }
  for (const raw of input.emails) {
    const normalized = normalizeEmail(raw);
    if (!normalized) continue;
    const hit = emailIndex.get(blindIndex(normalized));
    if (!hit || hit.userId === input.viewerUserId || seen.has(hit.userId)) continue;
    seen.add(hit.userId);
    out.push({ userId: hit.userId, reason: input.source, reasonLabel });
  }

  return out;
}

export const MAX_MATCH_IDENTIFIERS = 150;
