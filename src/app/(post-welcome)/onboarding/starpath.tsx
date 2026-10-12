import { Redirect } from 'expo-router';

import { useQaPreviewMode } from '@/qa/QaPreviewContext';
import { withQaPreviewHref } from '@/qa/qaPreviewRoutes';

/** Legacy route — redirects to the Process Screen (Starpath onboarding intro). */
export default function OnboardingStarpathRedirect() {
  const qaPreview = useQaPreviewMode();
  const href = qaPreview.active ? withQaPreviewHref('/process') : '/process';
  return <Redirect href={href as never} />;
}
