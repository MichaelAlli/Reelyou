import { useMemo } from 'react';

import { useReelyouConnect } from '@/connect/ReelyouConnectProvider';
import { currentUser } from '@/data/mockData';
import type { BeaconEligibleSkywrite } from '@/skywrite/beacon/beaconMatchEngine';
import { useSkywriteBeacon } from '@/skywrite/beacon/SkywriteBeaconProvider';
import { beaconNow } from '@/skywrite/beacon/beaconTime';

/** Full canonical active beacon queue for the viewer — uncapped, shared with Signal Center source. */
export function useContributionBeaconOverlayQueue(): BeaconEligibleSkywrite[] {
  const { messages } = useReelyouConnect();
  const { buildQueueForViewer } = useSkywriteBeacon();

  return useMemo(
    () => buildQueueForViewer(currentUser.id, messages.blockedUserIds, beaconNow()),
    [buildQueueForViewer, messages.blockedUserIds],
  );
}

/** @deprecated Alias — use useContributionBeaconOverlayQueue */
export function useActiveContributionBeacons(): BeaconEligibleSkywrite[] {
  return useContributionBeaconOverlayQueue();
}
