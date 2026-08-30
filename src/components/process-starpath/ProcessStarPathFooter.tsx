import { memo } from 'react';
import { StyleSheet, Text, View, type ViewStyle } from 'react-native';
import Animated, { type AnimatedStyle } from 'react-native-reanimated';

import { ProcessCopy, ProcessMetrics, ProcessPalette } from '@/components/process-starpath/processStarPathSpec';
import { Fonts } from '@/constants/theme';

interface ProcessStarPathFooterProps {
  animatedStyle?: AnimatedStyle<ViewStyle>;
}

function ProcessStarPathFooterComponent({ animatedStyle }: ProcessStarPathFooterProps) {
  return (
    <Animated.View style={[styles.wrap, animatedStyle]}>
      <Text style={styles.line1}>{ProcessCopy.footer1}</Text>
      <View style={styles.line2Row}>
        <Text style={styles.line2Muted}>Something </Text>
        <Text style={styles.line2Gold}>great</Text>
        <Text style={styles.line2Muted}> is coming.</Text>
      </View>
    </Animated.View>
  );
}

export const ProcessStarPathFooter = memo(ProcessStarPathFooterComponent);

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    gap: ProcessMetrics.footerGap,
    paddingTop: 2,
    paddingBottom: 8,
  },
  line1: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    fontWeight: '400',
    color: ProcessPalette.muted,
    textAlign: 'center',
    lineHeight: 19,
  },
  line2Row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
  },
  line2Muted: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    fontWeight: '400',
    color: ProcessPalette.muted,
    lineHeight: 19,
  },
  line2Gold: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    fontWeight: '600',
    color: ProcessPalette.gold,
    lineHeight: 19,
  },
});
