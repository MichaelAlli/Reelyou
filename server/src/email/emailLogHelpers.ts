import { normalizeEmailFrom } from './normalizeEmailFrom.js';

/** Safe for logs — domain or bare address only, never display name secrets. */
export function senderAddressForLog(fromRaw: string): string {
  const normalized = normalizeEmailFrom(fromRaw.trim());
  if (!normalized.ok) return 'invalid';
  const named = normalized.value.match(/<([^<>]+)>$/);
  if (named) return named[1]!.trim().toLowerCase();
  return normalized.value.toLowerCase();
}
