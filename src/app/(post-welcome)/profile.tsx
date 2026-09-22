import { Redirect, useLocalSearchParams } from 'expo-router';

import { currentUser } from '@/data/mockData';
import { resolveProfileRouteOwnerId } from '@/profile/resolveProfileRouteOwnerId';
import { buildVisitorProfileHref } from '@/profile/visitorProfileRoute';

/** Global menu alias — owner Profile / Me lives on the tab route. */
export default function ProfileAliasRoute() {
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const ownerId = resolveProfileRouteOwnerId(params.id);

  if (ownerId && ownerId !== currentUser.id) {
    return <Redirect href={buildVisitorProfileHref(ownerId) as never} />;
  }

  return <Redirect href={'/(tabs)/profile' as never} />;
}
