import type { TextStyle } from 'react-native';

import { Fonts } from '@/constants/theme';

/** Shared primary display name — matches Skywrite owner header (✦ Name). */
export const reelyouDisplayNameTypography: Pick<
  TextStyle,
  'fontFamily' | 'fontWeight' | 'letterSpacing'
> = {
  fontFamily: Fonts.serif,
  fontWeight: '400',
  letterSpacing: 0.15,
};
