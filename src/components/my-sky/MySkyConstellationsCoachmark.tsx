import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { MySkyCopy } from '@/constants/mySkyCopy';
import { Fonts } from '@/constants/theme';

interface MySkyConstellationsCoachmarkProps {
  visible: boolean;
  onDismiss: () => void;
}

function MySkyConstellationsCoachmarkComponent({
  visible,
  onDismiss,
}: MySkyConstellationsCoachmarkProps) {
  if (!visible) return null;

  return (
    <View style={styles.wrap} pointerEvents="box-none">
      <Pressable
        onPress={onDismiss}
        accessibilityRole="button"
        accessibilityLabel={MySkyCopy.constellationsCoachmarkA11y}
        style={styles.bubble}>
        <Text style={styles.text}>{MySkyCopy.constellationsCoachmark}</Text>
      </Pressable>
    </View>
  );
}

export const MySkyConstellationsCoachmark = memo(MySkyConstellationsCoachmarkComponent);

const styles = StyleSheet.create({
  wrap: {
    paddingTop: 4,
    maxWidth: 220,
  },
  bubble: {
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(12, 16, 32, 0.94)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(232, 200, 114, 0.32)',
  },
  text: {
    fontFamily: Fonts.sans,
    fontSize: 11.5,
    lineHeight: 15,
    color: 'rgba(248, 244, 236, 0.88)',
  },
});
