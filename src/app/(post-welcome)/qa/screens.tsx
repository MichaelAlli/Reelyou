import { Redirect } from 'expo-router';

import { QaScreenGalleryHub } from '@/components/qa/QaScreenGalleryHub';
import { useReelyouAuth } from '@/auth/ReelyouAuthProvider';
import { isQaPreviewGalleryAllowed } from '@/config/qaPreviewFlags';

/**
 * Internal QA screen gallery — /qa/screens
 * Requires EXPO_PUBLIC_ENABLE_QA_PREVIEW=1 and dev build or allowlisted email.
 */
export default function QaScreensRoute() {
  const auth = useReelyouAuth();
  const allowed = isQaPreviewGalleryAllowed(auth.user?.email ?? null);

  if (!allowed) {
    return <Redirect href={'/+not-found' as never} />;
  }

  return <QaScreenGalleryHub />;
}
