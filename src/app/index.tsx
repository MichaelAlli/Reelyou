import { Redirect } from 'expo-router';

import { consumeDevPreviewStartupRedirect } from '@/constants/devFlags';
import { SplashScreen } from '@/screens/SplashScreen';

/**
 * App entry — production always renders Splash.
 * Dev may temporarily redirect to Screen Preview via DEV_SCREEN_PREVIEW_STARTUP.
 */
export default function AppIndex() {
  if (consumeDevPreviewStartupRedirect()) {
    return <Redirect href={'/dev-screen-preview' as never} />;
  }

  return <SplashScreen />;
}
