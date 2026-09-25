import { Redirect, useLocalSearchParams } from 'expo-router';

import { DEV_EMERGING_CONSTELLATION_ID } from '@/emergingConstellations/emergingConstellationFixtures';

/** QA entry — emerging suggestion explore flow without Home card. */
export default function EmergingConstellationExploreRoute() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const target = typeof id === 'string' ? id : DEV_EMERGING_CONSTELLATION_ID;
  return (
    <Redirect
      href={`/emerging-constellation/preview?id=${encodeURIComponent(target)}` as never}
    />
  );
}
