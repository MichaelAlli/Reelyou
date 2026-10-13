import { Redirect, useLocalSearchParams } from 'expo-router';

import { resolveActiveUserId } from '@/auth/resolveActiveUserId';
import { useReelyouAuth } from '@/auth/ReelyouAuthProvider';
import { resolveProfileRouteOwnerId } from '@/profile/resolveProfileRouteOwnerId';
import { buildVisitorProfileHref } from '@/profile/visitorProfileRoute';
import { useQaPreviewMode } from '@/qa/QaPreviewContext';
import { preserveQaPreviewRedirectHref } from '@/qa/preserveQaPreviewRedirectHref';

/** Global menu alias — owner Profile / Me lives on the tab route. */
export default function ProfileAliasRoute() {
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const qaPreview = useQaPreviewMode();
  const { user: authUser } = useReelyouAuth();
  const sessionOwnerId = resolveActiveUserId(authUser);
  const ownerId = resolveProfileRouteOwnerId(params.id);

  if (ownerId && sessionOwnerId && ownerId !== sessionOwnerId) {
    return <Redirect href={buildVisitorProfileHref(ownerId) as never} />;
  }

  if (ownerId && !sessionOwnerId) {
    return <Redirect href={buildVisitorProfileHref(ownerId) as never} />;
  }

  const tabHref = preserveQaPreviewRedirectHref('/(tabs)/profile', {
    qaPreviewActive: qaPreview.active,
    qaState: qaPreview.qaState,
  });
  return <Redirect href={tabHref as never} />;
}
