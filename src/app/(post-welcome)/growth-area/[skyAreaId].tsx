import { useLocalSearchParams } from 'expo-router';

import { GrowthAreaScreen } from '@/screens/GrowthAreaScreen';

export default function GrowthAreaRoute() {
  const { skyAreaId } = useLocalSearchParams<{ skyAreaId?: string }>();
  return <GrowthAreaScreen key={skyAreaId} />;
}
