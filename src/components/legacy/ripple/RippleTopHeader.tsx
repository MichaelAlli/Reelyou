import { Image } from 'expo-image';
import { SymbolView } from 'expo-symbols';
import { Pressable, StyleSheet, View } from 'react-native';

import { RippleHeaderLogo } from '@/components/legacy/ripple/RippleHeaderLogo';
import { rippleGlass } from '@/components/legacy/ripple/rippleGlass';
import { currentUser } from '@/data/mockData';

interface RippleTopHeaderProps {
  onBack: () => void;
  onOpenInfo: () => void;
}

export function RippleTopHeader({ onBack, onOpenInfo }: RippleTopHeaderProps) {
  return (
    <View style={styles.row}>
      <Pressable
        onPress={onBack}
        style={rippleGlass.chromeButton}
        accessibilityRole="button"
        accessibilityLabel="Back">
        <SymbolView
          name={{ ios: 'chevron.left', android: 'chevron_left', web: 'chevron_left' }}
          size={18}
          tintColor="#4A5568"
          weight="semibold"
        />
      </Pressable>
      <View style={styles.logoSlot}>
        <RippleHeaderLogo />
      </View>
      <View style={styles.right}>
        <Pressable
          style={rippleGlass.chromeButton}
          accessibilityRole="button"
          accessibilityLabel="Ripple view guide"
          onPress={onOpenInfo}>
          <SymbolView
            name={{ ios: 'info.circle', android: 'info', web: 'info' }}
            size={17}
            tintColor="#4A5568"
          />
        </Pressable>
        {currentUser.avatarUri ? (
          <Image source={{ uri: currentUser.avatarUri }} style={styles.avatar} contentFit="cover" />
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 48,
  },
  logoSlot: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
});
