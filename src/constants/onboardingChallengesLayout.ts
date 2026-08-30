import { OnboardingProfileLayout } from '@/constants/onboardingProfileLayout';

/** Screen 3 layout tokens — inherits Screen 1/2 spacing and color system. */
export const OnboardingChallengesLayout = {
  ...OnboardingProfileLayout,
  skipColor: 'rgba(248, 249, 252, 0.55)',
} as const;

export {
  onboardingBackgroundImageStyle as onboardingChallengesBackgroundImageStyle,
  onboardingWebViewportStyle as onboardingChallengesWebViewportStyle,
  onboardingTitleShadow as onboardingChallengesTitleShadow,
} from '@/constants/onboardingProfileLayout';
