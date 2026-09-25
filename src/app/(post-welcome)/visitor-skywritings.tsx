import { useLocalSearchParams } from 'expo-router';

import { VisitorSkywritingsScreen } from '@/screens/VisitorSkywritingsScreen';

export default function VisitorSkywritingsRoute() {
  const { ownerId } = useLocalSearchParams<{ ownerId?: string }>();
  return <VisitorSkywritingsScreen ownerId={ownerId} />;
}
