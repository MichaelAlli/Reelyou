export const AuthCopy = {
  tagline: 'SHARE. GROW. CONTRIBUTE. BECOME.',
  logInTab: 'Log In',
  signUpTab: 'Sign Up',
  signUpTitle: 'Create Your Account',
  signUpSubtitle: 'Begin your journey. Your sky is waiting',
  fullNamePlaceholder: 'Full Name',
  emailPlaceholder: 'Email Address',
  phonePlaceholder: 'Phone Number (optional)',
  passwordPlaceholder: 'Password',
  confirmPasswordPlaceholder: 'Confirm Password',
  termsPrefix: 'I agree to the ',
  termsOfService: 'Terms of Service',
  termsMiddle: ' and ',
  privacyPolicy: 'Privacy Policy',
  createAccount: 'CREATE ACCOUNT',
  socialDivider: 'Or sign up with',
  footerPrefix: 'Already have an account? ',
  footerLink: 'Log in',
} as const;

export type AuthSocialProvider = 'google' | 'apple' | 'facebook';

export const AuthSocialLabels: Record<AuthSocialProvider, string> = {
  google: 'Google',
  apple: 'Apple',
  facebook: 'Facebook',
};
