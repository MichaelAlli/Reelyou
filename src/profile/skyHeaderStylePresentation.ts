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
      containerStyle: {
        borderColor: 'rgba(232, 200, 114, 0.45)',
        backgroundColor: 'rgba(232, 200, 114, 0.08)',
      },
      textStyle: {
        color: '#F5E6B8',
        textShadowColor: reduceMotion ? undefined : 'rgba(232, 200, 114, 0.35)',
        textShadowOffset: reduceMotion ? undefined : { width: 0, height: 0 },
        textShadowRadius: reduceMotion ? undefined : 6,
      },
      prefix: '',
      suffix: '',
      showConstellation: false,
    };
  }

  if (styleId === 'constellation') {
    return {
      containerStyle: {
        borderColor: 'rgba(167, 139, 250, 0.35)',
        backgroundColor: 'rgba(12, 10, 28, 0.55)',
      },
      textStyle: { color: '#FFF8F0' },
      prefix: '',
      suffix: '',
      showConstellation: !reduceMotion,
    };
  }

  return {
    containerStyle: {
      borderColor: 'rgba(232, 200, 114, 0.28)',
      backgroundColor: 'rgba(8, 10, 28, 0.45)',
    },
    textStyle: { color: '#FFF8F0' },
    prefix: '✦ ',
    suffix: '',
    showConstellation: false,
  };
}
