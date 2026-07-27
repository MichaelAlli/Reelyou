import { useTheme } from '@/theme';

import { SignUpDayScreen } from './SignUpDayScreen';
import { SignUpNightScreen } from './SignUpNightScreen';

/** Routes /signup to the locked daytime or cinematic nighttime Sign Up based on theme. */
export function SignUpScreen() {
  const { isLight } = useTheme();
  return isLight ? <SignUpDayScreen /> : <SignUpNightScreen />;
}
