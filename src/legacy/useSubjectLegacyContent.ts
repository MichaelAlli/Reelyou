import { currentUser } from '@/data/mockData';
import { useLegacy } from '@/legacy/LegacyProvider';
import type { LegacyMoment } from '@/legacy/legacyMomentTypes';
import type { ReelSequence } from '@/legacy/reelYouTypes';

const EMPTY_REEL: ReelSequence = {
  sequenceId: 'visitor-empty',
  ownerUserId: '',
  momentIds: [],
  generatedAt: 0,
  periodStart: null,
  periodEnd: null,
  privacy: 'public',
  userReviewed: true,
  createdAt: 0,
};

/**
 * Beta: durable Legacy / REEL-YOU content is built for the signed-in user's journey store.
 * Visitor routes use subjectUserId to select whose moments to filter for the viewer.
 */
export function useSubjectLegacyContent(subjectUserId: string) {
  const legacy = useLegacy();

  if (!subjectUserId || subjectUserId !== currentUser.id) {
    return {
      moments: [] as LegacyMoment[],
      reelSequence: EMPTY_REEL,
      momentById: () => undefined as LegacyMoment | undefined,
    };
  }

  return {
    moments: legacy.moments,
    reelSequence: legacy.reelSequence,
    momentById: legacy.momentById,
  };
}
