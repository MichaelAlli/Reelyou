import type { ViewStyle, TextStyle } from 'react-native';

import type { SkyHeaderStyleId } from '@/profile/skyHeaderStyleTypes';

export function skyHeaderStylePresentation(
  styleId: SkyHeaderStyleId,
  reduceMotion = false,
): {
  containerStyle: ViewStyle;
  textStyle: TextStyle;
  prefix: string;
  suffix: string;
  showConstellation: boolean;
} {
  if (styleId === 'golden_glow') {
    return {
      containerStyle: {},
      textStyle: {
        color: '#E8C872',
        fontWeight: '500',
        textShadowColor: reduceMotion ? undefined : 'rgba(232, 200, 114, 0.25)',
        textShadowOffset: reduceMotion ? undefined : { width: 0, height: 0 },
        textShadowRadius: reduceMotion ? undefined : 4,
      },
      prefix: '',
      suffix: '',
      showConstellation: false,
    };
  }

  if (styleId === 'constellation') {
    return {
      containerStyle: {},
      textStyle: { color: '#FFF8F0', fontWeight: '400' },
      prefix: '',
      suffix: '',
      showConstellation: !reduceMotion,
    };
  }

  return {
    containerStyle: {},
    textStyle: { color: '#FFF8F0', fontWeight: '400' },
    prefix: '',
    suffix: '',
    showConstellation: false,
  };
}
