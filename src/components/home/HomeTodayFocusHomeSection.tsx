import { memo } from 'react';
import { type ViewStyle } from 'react-native';
import { type AnimatedStyle } from 'react-native-reanimated';

import { HomeTodayFocusSection } from '@/components/home/HomeTodayFocusSection';

interface HomeTodayFocusHomeSectionProps {
  animatedStyle?: AnimatedStyle<ViewStyle>;
}

/** Full Today’s Focus card — mount only when presentation is `available`. */
function HomeTodayFocusHomeSectionComponent({ animatedStyle }: HomeTodayFocusHomeSectionProps) {
  return <HomeTodayFocusSection animatedStyle={animatedStyle} />;
}

export const HomeTodayFocusHomeSection = memo(HomeTodayFocusHomeSectionComponent);
