import { useMemo } from 'react';

import { useReelyouAuth } from '@/auth/ReelyouAuthProvider';
import { resolveActiveUserId } from '@/auth/resolveActiveUserId';
import { useReelyouConnect } from '@/connect/ReelyouConnectProvider';
import { useHumanPotentialMetrics } from '@/humanPotential/HumanPotentialMetricsProvider';
import { buildLegacyRippleViewModel } from '@/legacy/buildLegacyRippleViewModel';
import { buildRippleUserDirectory } from '@/legacy/rippleUserDirectory';
import { useSkywriteThreads } from '@/skywrite/threads/SkywriteThreadProvider';

export function useLegacyRippleViewModel() {
  const { user: authUser } = useReelyouAuth();
  const { state: metrics, isLoaded: metricsLoaded } = useHumanPotentialMetrics();
  const { contributions, isLoaded: threadsLoaded } = useSkywriteThreads();
  const { messages } = useReelyouConnect();

  const ownerUserId = resolveActiveUserId(authUser);

  const userDirectory = useMemo(
    () =>
      buildRippleUserDirectory(
        ownerUserId
          ? { id: ownerUserId, name: authUser?.fullName?.trim() || 'You' }
          : undefined,
      ),
    [authUser?.fullName, ownerUserId],
  );

  const model = useMemo(
    () =>
      buildLegacyRippleViewModel({
        ownerUserId: ownerUserId ?? '',
        metrics,
        contributions,
        userDirectory,
        blockedUserIds: messages.blockedUserIds,
      }),
    [contributions, metrics, messages.blockedUserIds, ownerUserId, userDirectory],
  );

  return {
    model,
    isLoaded: metricsLoaded && threadsLoaded,
    ownerUserId: ownerUserId ?? '',
    metrics,
    contributions,
    userDirectory,
    blockedUserIds: messages.blockedUserIds,
  };
}
