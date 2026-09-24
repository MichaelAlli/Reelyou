import { useMemo } from 'react';

import { currentUser } from '@/data/mockData';
import { useReelyouConnect } from '@/connect/ReelyouConnectProvider';
import { useHumanPotentialMetrics } from '@/humanPotential/HumanPotentialMetricsProvider';
import { buildLegacyRippleViewModel } from '@/legacy/buildLegacyRippleViewModel';
import { buildRippleUserDirectory } from '@/legacy/rippleUserDirectory';
import { useSkywriteThreads } from '@/skywrite/threads/SkywriteThreadProvider';

export function useLegacyRippleViewModel() {
  const { state: metrics, isLoaded: metricsLoaded } = useHumanPotentialMetrics();
  const { contributions, isLoaded: threadsLoaded } = useSkywriteThreads();
  const { messages } = useReelyouConnect();

  const userDirectory = useMemo(() => buildRippleUserDirectory(), []);

  const model = useMemo(
    () =>
      buildLegacyRippleViewModel({
        ownerUserId: currentUser.id,
        metrics,
        contributions,
        userDirectory,
        blockedUserIds: messages.blockedUserIds,
      }),
    [contributions, metrics, messages.blockedUserIds, userDirectory],
  );

  return {
    model,
    isLoaded: metricsLoaded && threadsLoaded,
    ownerUserId: currentUser.id,
    metrics,
    contributions,
    userDirectory,
    blockedUserIds: messages.blockedUserIds,
  };
}
