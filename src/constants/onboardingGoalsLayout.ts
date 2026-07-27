import { OnboardingProfileLayout } from '@/constants/onboardingProfileLayout';

/**
 * REELYOU Onboarding Screen 2 v1.0 — DESIGN LOCKED
 *
 * Status: DESIGN APPROVED | DESIGN LOCKED | NAVIGATION VERIFIED | READY FOR ONBOARDING SCREEN 3
 * Git rollback tag: "Onboarding Screen 2 v1.0 Design Lock"
 *
 * Layout tokens are frozen. Do not modify spacing, colors, typography, or
 * composition values without explicit design approval.
 */
export const OnboardingGoalsLayout = {
  ...OnboardingProfileLayout,
  /** Screen 2 skip link uses muted grey per UI reference. */
  skipColor: 'rgba(248, 249, 252, 0.55)',
  logoDividerGap: 10,
} as const;

export {
  onboardingBackgroundImageStyle as onboardingGoalsBackgroundImageStyle,
  onboardingWebViewportStyle as onboardingGoalsWebViewportStyle,
  onboardingTitleShadow as onboardingGoalsTitleShadow,
} from '@/constants/onboardingProfileLayout';
