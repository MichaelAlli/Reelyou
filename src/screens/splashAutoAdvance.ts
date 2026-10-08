/** Whether production splash should auto-advance to Welcome after the timer. */
export function shouldSplashAutoAdvance(options: {
  splashReviewMode: boolean;
  qaGalleryPreview: boolean;
}): boolean {
  return !options.splashReviewMode && !options.qaGalleryPreview;
}
