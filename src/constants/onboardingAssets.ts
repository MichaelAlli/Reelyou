/**
 * ONBOARDING BACKGROUND SYSTEM v1.0 — APPROVED | SHARED | DESIGN LOCKED
 *
 * All onboarding screens (1–4) use the exact same approved production background.
 * Source of truth: onboarding-profile-background.png (Screen 1 lock).
 *
 * Screens covered: Profile (1), Goals (2), and future Screens 3–4.
 * Do not add per-screen background variants without explicit design approval.
 */
export const ONBOARDING_SHARED_BACKGROUND = require('../assets/backgrounds/onboarding/onboarding-profile-background.png');

/** @deprecated Use ONBOARDING_SHARED_BACKGROUND — kept for import compatibility. */
export const OnboardingAssets = {
  sharedBackground: ONBOARDING_SHARED_BACKGROUND,
} as const;
