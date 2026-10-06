/** Mask email for user-facing reset confirmations (e.g. m***@gmail.com). */
export function maskEmail(email: string): string {
  const normalized = email.trim().toLowerCase();
  const at = normalized.indexOf('@');
  if (at <= 0 || at === normalized.length - 1) return '***';
  const local = normalized.slice(0, at);
  const domain = normalized.slice(at + 1);
  const prefix = local.length <= 1 ? '*' : `${local[0]}***`;
  return `${prefix}@${domain}`;
}
