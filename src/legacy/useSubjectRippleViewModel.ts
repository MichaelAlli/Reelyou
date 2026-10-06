import { useMemo } from 'react';

import { resolveActiveUserId } from '@/auth/resolveActiveUserId';
import { useReelyouAuth } from '@/auth/ReelyouAuthProvider';
import { useReelyouConnect } from '@/connect/ReelyouConnectProvider';
import { useHumanPotentialMetrics } from '@/humanPotential/HumanPotentialMetricsProvider';
import { EMPTY_HUMAN_POTENTIAL_METRICS_STATE } from '@/humanPotential/humanPotentialMetricsState';
import { buildLegacyRippleViewModel } from '@/legacy/buildLegacyRippleViewModel';
import { filterLegacyRippleViewModelForVisitor } from '@/legacy/filterLegacyRippleViewModelForVisitor';
import {
  canViewerAccessVisitorLegacyRoutes,
  type LegacyViewerContext,
} from '@/legacy/legacyViewerAccess';
import { buildRippleUserDirectory } from '@/legacy/rippleUserDirectory';
import { useOnboarding } from '@/onboarding';
import { useSkywriteThreads } from '@/skywrite/threads/SkywriteThreadProvider';

export function useSubjectRippleViewModel(
  subjectUserId: string,
  options?: { visitorPreview?: boolean },
) {
  const visitorPreview = options?.visitorPreview === true;
  const { state: metrics, isLoaded: metricsLoaded } = useHumanPotentialMetrics();
  const { contributions, isLoaded: threadsLoaded } = useSkywriteThreads();
  const { messages, skyFollowGraph } = useReelyouConnect();
  const { skywrites } = useOnboarding();
  const { user: authUser } = useReelyouAuth();
  const viewerUserId = resolveActiveUserId(authUser) ?? '';

  const userDirectory = useMemo(() => buildRippleUserDirectory(), []);

  const viewerContext: LegacyViewerContext = useMemo(
    () => ({
      subjectUserId,
      viewerUserId,
      followGraph: skyFollowGraph,
      blockedUserIds: messages.blockedUserIds,
    }),
    [messages.blockedUserIds, skyFollowGraph, subjectUserId, viewerUserId],
  );

  const accessAllowed = useMemo(
    () => canViewerAccessVisitorLegacyRoutes(viewerContext),
    [viewerContext],
  );

  const subjectMetrics =
    viewerUserId && subjectUserId === viewerUserId
      ? metrics
      : EMPTY_HUMAN_POTENTIAL_METRICS_STATE;
  const subjectContributions =
    viewerUserId && subjectUserId === viewerUserId ? contributions : [];

  const model = useMemo(() => {
    const ownerModel = buildLegacyRippleViewModel({
      ownerUserId: subjectUserId,
      metrics: subjectMetrics,
      contributions: subjectContributions,
      userDirectory,
      blockedUserIds: messages.blockedUserIds,
    });
    if (viewerUserId === subjectUserId && !visitorPreview) return ownerModel;
    return filterLegacyRippleViewModelForVisitor({
      model: ownerModel,
      ctx: viewerContext,
      metrics: subjectMetrics,
      skywrites,
    });
  }, [
    messages.blockedUserIds,
    skywrites,
    subjectContributions,
    subjectMetrics,
    subjectUserId,
    userDirectory,
    viewerContext,
    viewerUserId,
    visitorPreview,
  ]);

  return {
    model,
    isLoaded: metricsLoaded && threadsLoaded,
    ownerUserId: subjectUserId,
    metrics: subjectMetrics,
    contributions: subjectContributions,
    userDirectory,
    blockedUserIds: messages.blockedUserIds,
    viewerContext,
    accessAllowed,
    viewerUserId,
  };
}
