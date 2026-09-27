import { Platform, Share } from 'react-native';

import { buildShareableVisitorProfileUrl } from '@/profile/visitorProfileRoute';

export const OWNER_PROFILE_SHARE_TAGLINE = 'See what I’m becoming on REELYOU.';

export type ShareOwnerProfileResult = 'shared' | 'copied' | 'cancelled';

function isShareCancelled(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;
  const message = 'message' in error ? String((error as { message?: string }).message) : '';
  return message.toLowerCase().includes('cancel') || message.toLowerCase().includes('abort');
}

async function copyProfileUrl(url: string): Promise<boolean> {
  if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(url);
    return true;
  }
  return false;
}

/** Share canonical visitor profile — native/Web Share API with copy fallback. */
export async function shareOwnerProfile(input: {
  displayName: string;
  ownerId: string;
}): Promise<ShareOwnerProfileResult> {
  const url = buildShareableVisitorProfileUrl(input.ownerId);
  const title = `${input.displayName} on REELYOU`;
  const text = OWNER_PROFILE_SHARE_TAGLINE;

  try {
    if (Platform.OS === 'web' && typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      await navigator.share({ title, text, url });
      return 'shared';
    }

    const payload =
      Platform.OS === 'ios'
        ? { message: text, url, title }
        : { message: `${title}\n${text}\n${url}`, title };

    const result = await Share.share(payload, { dialogTitle: title, subject: title });
    if (result.action === Share.sharedAction) {
      return 'shared';
    }
    if (result.action === Share.dismissedAction) {
      return 'cancelled';
    }
  } catch (error) {
    if (isShareCancelled(error)) return 'cancelled';
  }

  const copied = await copyProfileUrl(url);
  if (copied) return 'copied';

  try {
    await Share.share({ message: `${title}\n${text}\n${url}` });
    return 'shared';
  } catch (error) {
    if (isShareCancelled(error)) return 'cancelled';
    return 'cancelled';
  }
}
