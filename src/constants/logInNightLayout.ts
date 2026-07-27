import { SignUpNightLayout } from '@/constants/signUpNightLayout';

/**
 * REELYOU Nighttime Sign In v1.0 — DESIGN LOCKED
 *
 * Status: DESIGN APPROVED | PRODUCTION READY | DESIGN LOCKED
 * Git rollback tag: "Nighttime Sign In v1.0 Design Lock"
 */
export const LogInNightLayout = {
  ...SignUpNightLayout,
  rememberMeTopGap: 4,
  forgotPasswordTopGap: 2,
} as const;

export {
  resolveSignUpNightLogoWidth as resolveLogInNightLogoWidth,
  resolveSignUpNightTopInset as resolveLogInNightTopInset,
  signUpNightWebViewportStyle as logInNightWebViewportStyle,
} from '@/constants/signUpNightLayout';
