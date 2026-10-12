import { StyleSheet, Text, View } from 'react-native';
import { SymbolView } from 'expo-symbols';

import { rippleGlass } from '@/components/legacy/ripple/rippleGlass';
import { Fonts, Spacing } from '@/constants/theme';

interface ImpactSupportBannerProps {
  lead: string;
  tail: string;
  accentMessage?: string;
}

export function ImpactSupportBanner({ lead, tail, accentMessage }: ImpactSupportBannerProps) {
  return (
    <View style={[rippleGlass.panel, styles.banner]}>
      <View style={styles.iconWrap}>
        <SymbolView
          name={{ ios: 'sparkles', android: 'star', web: 'star' }}
          size={18}
          tintColor="#C4A035"
        />
      </View>
      <View style={styles.copy}>
        {accentMessage ? <Text style={styles.accent}>{accentMessage}</Text> : null}
        <Text style={styles.lead}>{lead}</Text>
        <Text style={styles.tail}>{tail}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    marginTop: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  iconWrap: {
    marginTop: 2,
  },
  copy: {
    flex: 1,
    gap: 4,
  },
  accent: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    fontWeight: '600',
    color: '#5A6578',
    lineHeight: 18,
  },
  lead: {
    fontFamily: Fonts.serif,
    fontSize: 15,
    fontWeight: '600',
    color: '#2D3748',
    lineHeight: 21,
  },
  tail: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    color: 'rgba(45, 55, 72, 0.78)',
    lineHeight: 18,
  },
});
