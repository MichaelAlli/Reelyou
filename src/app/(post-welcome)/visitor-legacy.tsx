import { useLocalSearchParams } from 'expo-router';

import { VisitorLegacyScreen } from '@/screens/VisitorLegacyScreen';

export default function VisitorLegacyRoute() {
  const { ownerId } = useLocalSearchParams<{ ownerId?: string }>();
  return <VisitorLegacyScreen ownerId={ownerId} />;
}
