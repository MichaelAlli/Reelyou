import { memo, ReactNode } from 'react';
import { StyleSheet, Text, TextStyle } from 'react-native';

import { typography } from '@/theme';

export interface BodyTextProps {
  children: ReactNode;
  style?: TextStyle;
}

function BodyTextComponent({ children, style }: BodyTextProps) {
  return <Text style={[styles.body, style]}>{children}</Text>;
}

export const BodyText = memo(BodyTextComponent);

const styles = StyleSheet.create({
  body: {
    ...typography.Body,
  },
});
