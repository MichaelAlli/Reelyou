import { SignUpDayLayout } from '@/constants/signUpDayLayout';

/**
 * REELYOU Daytime Sign In v1.0 — DESIGN LOCKED
 *
 * Status: DESIGN APPROVED | PRODUCTION READY | DESIGN LOCKED
 * Git rollback tag: "Daytime Sign In v1.0 Design Lock"
 */
export const LogInDayLayout = {
  ...SignUpDayLayout,
  rememberMeTopGap: 4,
  forgotPasswordTopGap: 2,
} as const;

export {
  resolveSignUpDayLogoWidth as resolveLogInDayLogoWidth,
  resolveSignUpDayTopInset as resolveLogInDayTopInset,
  signUpDayFontRender as logInDayFontRender,
  signUpDayTextReadabilityShadow as logInDayTextReadabilityShadow,
  signUpDayWebViewportStyle as logInDayWebViewportStyle,
} from '@/constants/signUpDayLayout';
