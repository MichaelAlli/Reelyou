import { useMemo } from 'react';

import { currentUser } from '@/data/mockData';
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

export function useSubjectRippleViewModel(subjectUserId: string) {
  const { state: metrics, isLoaded: metricsLoaded } = useHumanPotentialMetrics();
  const { contributions, isLoaded: threadsLoaded } = useSkywriteThreads();
  const { messages, skyFollowGraph } = useReelyouConnect();
  const { skywrites } = useOnboarding();
  const viewerUserId = currentUser.id;

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
    subjectUserId === currentUser.id ? metrics : EMPTY_HUMAN_POTENTIAL_METRICS_STATE;
  const subjectContributions = subjectUserId === currentUser.id ? contributions : [];

  const model = useMemo(() => {
    const ownerModel = buildLegacyRippleViewModel({
      ownerUserId: subjectUserId,
      metrics: subjectMetrics,
      contributions: subjectContributions,
      userDirectory,
      blockedUserIds: messages.blockedUserIds,
    });
    if (viewerUserId === subjectUserId) return ownerModel;
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
