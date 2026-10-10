/**
 * REELYOU Welcome Screen — official design lock record.
 * Do not change Welcome visuals without explicit product approval.
 */
export const WELCOME_DESIGN_LOCK = {
  status: 'LOCKED' as const,
  version: 'v1.0',
  /** Git checkpoint where approved composition was restored after viewport work. */
  checkpointCommit: 'a972955eff7adc6b2721c85624e912f6b67938e9',
  /** Playwright screenshot baselines (repo-relative). */
  visualBaselineDir: 'test/visual-baselines/welcome',
  /** Locked marketing logo asset (transparent PNG). */
  welcomeLogoAssetKey: 'welcomeLogoWhiteTaglineCropped' as const,
  qaPreviewQuery: 'qaPreview=1',
} as const;
