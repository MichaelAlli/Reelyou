import { getPersonalJourney, updatePersonalJourney } from './personalJourneyStore.js';

export function handleGetMyPersonalJourney(userId: string) {
  const journey = getPersonalJourney(userId);
  return { ok: true as const, journey };
}

export function handlePatchMyPersonalJourney(
  userId: string,
  body: { customTitle?: unknown; orderedSkywriteIds?: unknown },
) {
  const result = updatePersonalJourney(userId, body);
  if ('error' in result) {
    return { ok: false as const, error: result.error };
  }
  return { ok: true as const, journey: result };
}

export function handleGetUserPersonalJourneyForViewer(
  ownerUserId: string,
  _viewerUserId: string,
) {
  const journey = getPersonalJourney(ownerUserId);
  return {
    ok: true as const,
    journey: {
      customTitle: journey.customTitle,
      orderedSkywriteIds: journey.orderedSkywriteIds,
      updatedAt: journey.updatedAt,
    },
  };
}
