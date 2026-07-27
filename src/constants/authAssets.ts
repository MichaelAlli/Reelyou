import { LogInAssets } from '@/constants/logInAssets';

/**
 * Auth background assets for Sign Up screens.
 * signup-day-landscape-TEMP.png: daytime Sign Up background (already committed under temp/).
 * signupNightLandscape: permanent approved nighttime landscape (same artwork as Sign In night).
 */
export const AuthTempAssets = {
  signupDayLandscape: require('../assets/temp/signup-day-landscape-TEMP.png'),
  signupNightLandscape: LogInAssets.loginNightBackground,
} as const;
