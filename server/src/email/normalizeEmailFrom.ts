/** RFC5322-lite local part + domain check for transactional From addresses. */
const EMAIL_ADDR = /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/;

export type NormalizeEmailFromResult =
  | { ok: true; value: string; domain: string }
  | { ok: false; reason: string };

function stripOuterQuotes(value: string): string {
  const s = value.trim();
  if (s.length >= 2 && ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'")))) {
    return s.slice(1, -1).trim();
  }
  return s;
}

function domainFromAddress(email: string): string | null {
  const at = email.lastIndexOf('@');
  if (at <= 0 || at >= email.length - 1) return null;
  return email.slice(at + 1).toLowerCase();
}

function validateEmailAddress(email: string): boolean {
  return EMAIL_ADDR.test(email);
}

/**
 * Normalize EMAIL_FROM for Resend/SMTP.
 * Accepts plain email, `Name <email>`, and bare `<email>` (common Render paste mistake).
 */
export function normalizeEmailFrom(raw: string): NormalizeEmailFromResult {
  let s = stripOuterQuotes(raw);
  if (!s) return { ok: false, reason: 'empty_from' };

  const bareBrackets = s.match(/^<([^<>]+)>$/);
  if (bareBrackets) {
    s = bareBrackets[1].trim();
  }

  const named = s.match(/^(.+?)\s*<([^<>]+)>$/);
  if (named) {
    const displayName = stripOuterQuotes(named[1].trim());
    const addr = named[2].trim();
    if (!validateEmailAddress(addr)) return { ok: false, reason: 'invalid_email_in_from' };
    const domain = domainFromAddress(addr);
    if (!domain) return { ok: false, reason: 'invalid_domain_in_from' };
    const safeName = displayName.replace(/[\r\n"]/g, '');
    return { ok: true, value: `${safeName} <${addr}>`, domain };
  }

  if (validateEmailAddress(s)) {
    const domain = domainFromAddress(s);
    if (!domain) return { ok: false, reason: 'invalid_domain_in_from' };
    return { ok: true, value: s, domain };
  }

  return { ok: false, reason: 'invalid_from_format' };
}

/** Strip quotes and accidental Bearer prefix from API keys in env vars. */
export function normalizeSecretEnv(value: string): string {
  let s = stripOuterQuotes(value.trim());
  if (/^bearer\s+/i.test(s)) {
    s = s.replace(/^bearer\s+/i, '').trim();
  }
  return s;
}
