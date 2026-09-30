import { Linking, Platform, Share } from 'react-native';

import {
  buildEditableInvitationMessage,
  buildInvitationUrl,
  isShareableHttpsOriginConfigured,
} from '@/friendDiscovery/buildInvitationLink';

export type InvitationShareResult = 'shared' | 'copied' | 'cancelled' | 'opened_composer' | 'blocked';

function isShareCancelled(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;
  const message = 'message' in error ? String((error as { message?: string }).message) : '';
  return message.toLowerCase().includes('cancel') || message.toLowerCase().includes('abort');
}

async function copyText(text: string): Promise<boolean> {
  if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return true;
  }
  return false;
}

export async function shareReelyouInvitation(input: {
  ownerId: string;
  displayName: string;
}): Promise<InvitationShareResult> {
  if (!isShareableHttpsOriginConfigured() && !__DEV__) {
    return 'blocked';
  }
  const message = buildEditableInvitationMessage(input.ownerId, input.displayName);
  const url = buildInvitationUrl(input.ownerId);
  const title = `${input.displayName} on Reelyou`;

  try {
    if (Platform.OS === 'web' && typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      await navigator.share({ title, text: message, url });
      return 'shared';
    }
    const payload =
      Platform.OS === 'ios'
        ? { message, url, title }
        : { message, title };

    const result = await Share.share(payload, { dialogTitle: title, subject: title });
    if (result.action === Share.sharedAction) return 'shared';
    if (result.action === Share.dismissedAction) return 'cancelled';
  } catch (error) {
    if (isShareCancelled(error)) return 'cancelled';
  }

  const copied = await copyText(message);
  return copied ? 'copied' : 'cancelled';
}

export async function copyInvitationLink(ownerId: string): Promise<boolean> {
  return copyText(buildInvitationUrl(ownerId));
}

/** User-controlled email composer — app does not send mail. */
export async function openEmailInvitationComposer(input: {
  ownerId: string;
  displayName: string;
}): Promise<InvitationShareResult> {
  const body = encodeURIComponent(buildEditableInvitationMessage(input.ownerId, input.displayName));
  const subject = encodeURIComponent(`Join me on Reelyou`);
  const mailto = `mailto:?subject=${subject}&body=${body}`;
  const can = await Linking.canOpenURL(mailto);
  if (!can) {
    const copied = await copyText(buildEditableInvitationMessage(input.ownerId, input.displayName));
    return copied ? 'copied' : 'cancelled';
  }
  await Linking.openURL(mailto);
  return 'opened_composer';
}

/** SMS composer — user picks recipient and sends. */
export async function openSmsInvitationComposer(input: {
  ownerId: string;
  displayName: string;
}): Promise<InvitationShareResult> {
  const body = encodeURIComponent(buildEditableInvitationMessage(input.ownerId, input.displayName));
  const sms = Platform.OS === 'ios' ? `sms:&body=${body}` : `sms:?body=${body}`;
  const can = await Linking.canOpenURL(sms);
  if (!can) {
    const copied = await copyText(buildEditableInvitationMessage(input.ownerId, input.displayName));
    return copied ? 'copied' : 'cancelled';
  }
  await Linking.openURL(sms);
  return 'opened_composer';
}

/** Instagram is a share destination only — not friend import. */
export async function shareInvitationViaNativeSheet(input: {
  ownerId: string;
  displayName: string;
}): Promise<InvitationShareResult> {
  return shareReelyouInvitation(input);
}
