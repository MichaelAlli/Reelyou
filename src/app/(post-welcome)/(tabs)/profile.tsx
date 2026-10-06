import { Redirect, useLocalSearchParams } from 'expo-router';

import { resolveActiveUserId } from '@/auth/resolveActiveUserId';
import { useReelyouAuth } from '@/auth/ReelyouAuthProvider';
import { resolveProfileRouteOwnerId } from '@/profile/resolveProfileRouteOwnerId';
import { buildVisitorProfileHref } from '@/profile/visitorProfileRoute';
import { OwnerProfileScreen } from '@/screens/OwnerProfileScreen';

export default function ProfileTabRoute() {
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const { user: authUser } = useReelyouAuth();
  const sessionOwnerId = resolveActiveUserId(authUser);
  const ownerId = resolveProfileRouteOwnerId(params.id);

  if (ownerId && sessionOwnerId && ownerId !== sessionOwnerId) {
    return <Redirect href={buildVisitorProfileHref(ownerId) as never} />;
  }

  if (ownerId && !sessionOwnerId) {
    return <Redirect href={buildVisitorProfileHref(ownerId) as never} />;
  }

  return <OwnerProfileScreen />;
}
