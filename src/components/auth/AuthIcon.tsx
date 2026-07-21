import { StyleSheet, View } from 'react-native';
import { SymbolView, type SymbolViewProps } from 'expo-symbols';

import { SignUpDayLayout } from '@/constants/signUpDayLayout';

export type AuthIconName = 'person' | 'envelope' | 'phone' | 'lock' | 'eye' | 'eyeSlash' | 'arrowRight' | 'checkmark';

const ICON_SIZE = 18;
const ICON_SLOT = SignUpDayLayout.fieldIconSlot;
const GOLD = SignUpDayLayout.goldAccent;

const ICON_SYMBOL: Record<AuthIconName, SymbolViewProps['name']> = {
  person: { ios: 'person.fill', android: 'person', web: 'person' },
  envelope: { ios: 'envelope.fill', android: 'mail', web: 'mail' },
  phone: { ios: 'iphone', android: 'smartphone', web: 'smartphone' },
  lock: { ios: 'lock.fill', android: 'lock', web: 'lock' },
  eye: { ios: 'eye.fill', android: 'visibility', web: 'visibility' },
  eyeSlash: { ios: 'eye.slash.fill', android: 'visibility_off', web: 'visibility_off' },
  arrowRight: { ios: 'arrow.right', android: 'arrow_forward', web: 'arrow_forward' },
  checkmark: { ios: 'checkmark', android: 'check', web: 'check' },
};

interface AuthIconProps {
  name: AuthIconName;
  size?: number;
  color?: string;
}

export function AuthIcon({ name, size = ICON_SIZE, color = GOLD }: AuthIconProps) {
  return (
    <View style={styles.wrap} importantForAccessibility="no-hide-descendants">
      <SymbolView
        name={ICON_SYMBOL[name]}
        size={size}
        tintColor={color}
        weight="regular"
        style={styles.symbol}
        accessibilityElementsHidden
        importantForAccessibility="no"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: ICON_SLOT,
    height: ICON_SLOT,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    overflow: 'hidden',
  },
  symbol: {
    width: ICON_SIZE,
    height: ICON_SIZE,
  },
});
