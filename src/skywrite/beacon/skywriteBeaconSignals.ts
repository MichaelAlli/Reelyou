import {
  beaconSignalIdForSkywrite,
  type BeaconEligibleSkywrite,
} from '@/skywrite/beacon/skywriteBeaconEligibility';

export interface ContributionBeaconSignalCandidate {
  signalId: string;
  skywriteId: string;
  title: string;
  description: string;
  createdAt: number;
  skyAreaId: string;
}

export function contributionBeaconSignalsFromQueue(
  queue: readonly BeaconEligibleSkywrite[],
): ContributionBeaconSignalCandidate[] {
  return queue.map((entry) => toSignalCandidate(entry));
}

function toSignalCandidate(entry: BeaconEligibleSkywrite): ContributionBeaconSignalCandidate {
  const transparency = `You may have something meaningful to share in ${entry.areaLabel}.`;
  return {
    signalId: beaconSignalIdForSkywrite(entry.skywrite.id),
    skywriteId: entry.skywrite.id,
    title: `Someone in ${entry.areaLabel} is looking for perspective.`,
    description: transparency,
    createdAt: entry.createdAtMs,
    skyAreaId: entry.skyAreaId,
  };
}
