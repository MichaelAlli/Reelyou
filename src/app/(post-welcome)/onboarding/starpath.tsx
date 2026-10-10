import { Redirect, useGlobalSearchParams } from 'expo-router';

import { withQaPreviewHref } from '@/qa/qaPreviewRoutes';

/** Legacy route — redirects to the Process Screen (Starpath onboarding intro). */
export default function OnboardingStarpathRedirect() {
  const params = useGlobalSearchParams<{ qaPreview?: string }>();
  const href =
    params.qaPreview === '1' ? withQaPreviewHref('/process') : ('/process' as const);
  return <Redirect href={href as never} />;
}
