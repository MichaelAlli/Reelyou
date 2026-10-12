import { Redirect } from 'expo-router';

import { isDevRuntime } from '@/constants/devFlags';
import { useQaPreviewMode } from '@/qa/QaPreviewContext';
import { AuthDiagnosticScreen } from '@/screens/dev/AuthDiagnosticScreen';

export default function DevAuthDiagnosticRoute() {
  const qaPreview = useQaPreviewMode();
  if (!isDevRuntime() && !qaPreview.active) {
    return <Redirect href={'/welcome' as never} />;
  }
  return <AuthDiagnosticScreen />;
}
