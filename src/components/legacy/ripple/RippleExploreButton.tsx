import { Pressable, StyleSheet, Text } from 'react-native';

import { rippleGlass } from '@/components/legacy/ripple/rippleGlass';
import { RippleCopy } from '@/constants/rippleCopy';
import { Fonts } from '@/constants/theme';

interface RippleExploreButtonProps {
  onPress: () => void;
}

export function RippleExploreButton({ onPress }: RippleExploreButtonProps) {
  return (
    <Pressable
      style={[rippleGlass.pill, styles.btn]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={RippleCopy.exploreMap}>
      <Text style={styles.text}>{RippleCopy.exploreMap}</Text>
      <Text style={styles.chevron}>⌄</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginTop: 12,
    marginBottom: 4,
  },
  text: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    fontWeight: '600',
    color: '#4A5568',
  },
  chevron: {
    fontSize: 14,
    color: '#718096',
    marginTop: -2,
  },
});
