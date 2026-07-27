import { useTheme } from '@/theme';

import { LogInDayScreen } from './LogInDayScreen';
import { LogInNightScreen } from './LogInNightScreen';

/** Routes /login to the Daytime or Nighttime Sign In screen based on theme. */
export function LogInScreen() {
  const { isLight } = useTheme();
  return isLight ? <LogInDayScreen /> : <LogInNightScreen />;
}
