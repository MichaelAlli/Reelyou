import { SplashScreen } from '@/screens/SplashScreen';

/** Isolated QA splash preview — reuses production SplashScreen; no auto-advance to Welcome. */
export default function QaSplashPreviewRoute() {
  return <SplashScreen qaGalleryPreview />;
}
