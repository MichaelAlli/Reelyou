import { memo, ReactNode } from 'react';
import { StyleSheet, Text, TextStyle } from 'react-native';

import { typography } from '@/theme';

export interface HeadlineProps {
  children: ReactNode;
  style?: TextStyle;
}

function HeadlineComponent({ children, style }: HeadlineProps) {
  return <Text style={[styles.headline, style]}>{children}</Text>;
}

export const Headline = memo(HeadlineComponent);

const styles = StyleSheet.create({
  headline: {
    ...typography.Headline,
  },
});
