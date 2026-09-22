import { useLocalSearchParams } from 'expo-router';

import { resolveProfileRouteOwnerId } from '@/profile/resolveProfileRouteOwnerId';
import { VisitorProfileScreen } from '@/screens/VisitorProfileScreen';

export default function VisitorProfileRoute() {
  const params = useLocalSearchParams<{ id?: string | string[]; userId?: string | string[] }>();
  const ownerId =
    resolveProfileRouteOwnerId(params.id) ?? resolveProfileRouteOwnerId(params.userId);

  return <VisitorProfileScreen ownerId={ownerId} key={ownerId ?? 'missing'} />;
}
