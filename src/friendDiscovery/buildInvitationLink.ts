import { buildShareableVisitorProfileUrl } from '@/profile/visitorProfileRoute';

export const DEFAULT_INVITATION_MESSAGE =
  'Join me on Reelyou—a place to share your journey, grow, and find your people. Explore my Sky:';

export function buildInvitationUrl(ownerId: string): string {
  const base = buildShareableVisitorProfileUrl(ownerId);
  const separator = base.includes('?') ? '&' : '?';
  return `${base}${separator}invite=1`;
}

export function buildEditableInvitationMessage(ownerId: string, displayName?: string): string {
  const link = buildInvitationUrl(ownerId);
  const lead = displayName?.trim()
    ? `${displayName} invited you to Reelyou.`
    : DEFAULT_INVITATION_MESSAGE;
  return `${lead} ${link}`;
}

/** True when production HTTPS origin is configured (not scheme-only / localhost in release). */
export function isShareableHttpsOriginConfigured(): boolean {
  const configured = process.env.EXPO_PUBLIC_APP_ORIGIN?.replace(/\/$/, '');
  if (configured?.startsWith('https://')) return true;
  if (__DEV__) return true;
  return false;
}
