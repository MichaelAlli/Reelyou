import { useMemo } from 'react';

import { useEffectiveViewerId } from '@/auth/useSessionUserId';
import { useReelyouConnect } from '@/connect/ReelyouConnectProvider';
import type { BeaconEligibleSkywrite } from '@/skywrite/beacon/beaconMatchEngine';
import { useSkywriteBeacon } from '@/skywrite/beacon/SkywriteBeaconProvider';
import { beaconNow } from '@/skywrite/beacon/beaconTime';

/** Full canonical active beacon queue for the viewer — uncapped, shared with Signal Center source. */
export function useContributionBeaconOverlayQueue(): BeaconEligibleSkywrite[] {
  const viewerId = useEffectiveViewerId();
  const { messages } = useReelyouConnect();
  const { buildQueueForViewer } = useSkywriteBeacon();

  return useMemo(
    () =>
      viewerId
        ? buildQueueForViewer(viewerId, messages.blockedUserIds, beaconNow())
        : [],
    [buildQueueForViewer, messages.blockedUserIds, viewerId],
  );
}

/** @deprecated Alias — use useContributionBeaconOverlayQueue */
export function useActiveContributionBeacons(): BeaconEligibleSkywrite[] {
  return useContributionBeaconOverlayQueue();
}
