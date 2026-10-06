import { buildPublicSkyView } from '@/mySky/buildPublicSkyView';
import type { SkyConnectionStatus } from '@/mySky/skyIdentity';
import { resolveOrbitOwnerSkywrites } from '@/profile/orbitProfileSkywriteFixtures';
import type { PlaySkySequenceRegistry } from '@/skywrite/play/playSkySequenceEligibility';
import { resolveFocusedSkyPlaySteps } from '@/skywrite/play/skywritePlayLogic';
import { EMPTY_SKYWRITE_PLAY_SEQUENCE } from '@/skywrite/play/skywritePlayTypes';
import type { SkywriteRecord } from '@/skywrite/types';
import { isExplicitDevDemoModeEnabled } from '@/auth/demoMode';
import { currentUser } from '@/data/mockData';
import { mergeExploreDemoPlaySkyRegistry } from '@/explore/exploreDemoSkies';

export function resolveOwnerPlaySkySteps(input: {
  ownerId: string;
  /** Signed-in viewer; when it matches ownerId, use real ownerSkywrites instead of orbit fixtures. */
  sessionOwnerId?: string | null;
  connectionStatus: SkyConnectionStatus;
  ownerSkywrites?: readonly SkywriteRecord[];
  registry?: PlaySkySequenceRegistry;
  nowMs?: number;
  retainExpiredInSequence?: boolean;
}) {
  const selfId =
    input.sessionOwnerId?.trim() ||
    (isExplicitDevDemoModeEnabled() ? currentUser.id : null);
  const posts =
    selfId && input.ownerId === selfId
      ? input.ownerSkywrites ?? []
      : input.ownerSkywrites ?? resolveOrbitOwnerSkywrites(input.ownerId);
  const skyView = buildPublicSkyView(
    input.ownerId,
    input.connectionStatus,
    undefined,
    undefined,
    posts.length ? posts : undefined,
  );
  if (!skyView) return [];
  const registry = input.registry
    ? mergeExploreDemoPlaySkyRegistry(input.registry, input.nowMs)
    : undefined;
  return resolveFocusedSkyPlaySteps(
    skyView.stars,
    [...posts],
    EMPTY_SKYWRITE_PLAY_SEQUENCE.focusedSky,
    EMPTY_SKYWRITE_PLAY_SEQUENCE.singleBySkywriteId,
    {
      playSkyRegistry: registry,
      nowMs: input.nowMs,
      retainExpiredInSequence: input.retainExpiredInSequence,
      sessionOwnerId: selfId,
    },
  );
}
