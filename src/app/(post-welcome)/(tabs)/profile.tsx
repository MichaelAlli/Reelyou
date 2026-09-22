import { Redirect, useLocalSearchParams } from 'expo-router';

import { currentUser } from '@/data/mockData';
import { resolveProfileRouteOwnerId } from '@/profile/resolveProfileRouteOwnerId';
import { buildVisitorProfileHref } from '@/profile/visitorProfileRoute';
import { OwnerProfileScreen } from '@/screens/OwnerProfileScreen';

export default function ProfileTabRoute() {
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const ownerId = resolveProfileRouteOwnerId(params.id);

  if (ownerId && ownerId !== currentUser.id) {
    return <Redirect href={buildVisitorProfileHref(ownerId) as never} />;
  }

  return <OwnerProfileScreen />;
}
