import type { CanonicalSignalEvent } from '@/signals/canonical/canonicalSignalModels';

export interface SignalPrivacyContext {
  viewerUserId: string;
  ownerUserId: string;
  blockedUserIds: readonly string[];
  isMutualSkyFriend: boolean;
}

export function shouldSuppressSignalForBlock(
  event: CanonicalSignalEvent,
  ctx: SignalPrivacyContext,
): boolean {
  if (ctx.viewerUserId !== ctx.ownerUserId) return true;
  for (const relatedId of event.relatedUserIds) {
    if (ctx.blockedUserIds.includes(relatedId)) return true;
  }
  return false;
}

export function signalPrivacyAllowsPresentation(
  event: CanonicalSignalEvent,
  ctx: SignalPrivacyContext,
): boolean {
  if (ctx.viewerUserId !== event.userId) return false;
  if (shouldSuppressSignalForBlock(event, ctx)) return false;
  if (event.privacyScope === 'owner_only') return ctx.viewerUserId === event.userId;
  if (event.privacyScope === 'connected_skies') {
    return ctx.viewerUserId === event.userId || ctx.isMutualSkyFriend;
  }
  return true;
}

/** Presentation copy must not leak private source content. */
export function sanitizeSignalMetadataForPresentation(
  event: CanonicalSignalEvent,
  sourceDeleted: boolean,
): Record<string, string | number | boolean | string[]> {
  if (!sourceDeleted) return { ...event.metadata };
  const next = { ...event.metadata };
  delete next.sourceExcerpt;
  delete next.privateReflectionExcerpt;
  delete next.messagePreview;
  next.sourceUnavailable = true;
  return next;
}
