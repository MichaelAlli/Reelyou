import { buildPublicSkyView } from '@/mySky/buildPublicSkyView';
import type { SkyConnectionStatus } from '@/mySky/skyIdentity';
import { resolveOrbitOwnerSkywrites } from '@/profile/orbitProfileSkywriteFixtures';
import type { PlaySkySequenceRegistry } from '@/skywrite/play/playSkySequenceEligibility';
import { resolveFocusedSkyPlaySteps } from '@/skywrite/play/skywritePlayLogic';
import { EMPTY_SKYWRITE_PLAY_SEQUENCE } from '@/skywrite/play/skywritePlayTypes';
import type { SkywriteRecord } from '@/skywrite/types';
import { currentUser } from '@/data/mockData';
import { mergeExploreDemoPlaySkyRegistry } from '@/explore/exploreDemoSkies';

export function resolveOwnerPlaySkySteps(input: {
  ownerId: string;
  connectionStatus: SkyConnectionStatus;
  ownerSkywrites?: readonly SkywriteRecord[];
  registry?: PlaySkySequenceRegistry;
  nowMs?: number;
  retainExpiredInSequence?: boolean;
}) {
  const posts =
    input.ownerId === currentUser.id
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
    },
  );
}
