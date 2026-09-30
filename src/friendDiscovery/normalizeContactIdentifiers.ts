/** Normalize contact identifiers for server-side matching — never match by name alone. */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function normalizeEmailForMatch(raw: string): string | null {
  const trimmed = raw.trim().toLowerCase();
  if (!trimmed || !EMAIL_RE.test(trimmed)) return null;
  return trimmed;
}

/** Strip to digits; optional default region for 10-digit US numbers. */
export function normalizePhoneForMatch(raw: string, defaultCountryCallingCode = '1'): string | null {
  const digits = raw.replace(/\D/g, '');
  if (digits.length < 10) return null;
  if (digits.length === 10) return `+${defaultCountryCallingCode}${digits}`;
  if (digits.length === 11 && digits.startsWith('1')) return `+${digits}`;
  if (raw.trim().startsWith('+') && digits.length >= 10) return `+${digits}`;
  if (digits.length >= 11) return `+${digits}`;
  return null;
}

export function dedupeStrings(values: readonly string[]): string[] {
  return [...new Set(values.filter(Boolean))];
}

export function extractEmailsFromContactFields(
  emails: readonly { email?: string | null }[] | undefined,
): string[] {
  if (!emails?.length) return [];
  const out: string[] = [];
  for (const entry of emails) {
    const normalized = entry.email ? normalizeEmailForMatch(entry.email) : null;
    if (normalized) out.push(normalized);
  }
  return dedupeStrings(out);
}

export function extractPhonesFromContactFields(
  phones: readonly { number?: string | null }[] | undefined,
  defaultCountryCallingCode = '1',
): string[] {
  if (!phones?.length) return [];
  const out: string[] = [];
  for (const entry of phones) {
    const normalized = entry.number
      ? normalizePhoneForMatch(entry.number, defaultCountryCallingCode)
      : null;
    if (normalized) out.push(normalized);
  }
  return dedupeStrings(out);
}
