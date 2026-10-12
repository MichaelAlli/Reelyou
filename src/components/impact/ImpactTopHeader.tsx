import { Image } from 'expo-image';
import { SymbolView } from 'expo-symbols';
import { Pressable, StyleSheet, View } from 'react-native';

import { RippleHeaderLogo } from '@/components/legacy/ripple/RippleHeaderLogo';
import { rippleGlass } from '@/components/legacy/ripple/rippleGlass';
import { useUserAvatar } from '@/identity/UserAvatarProvider';

interface ImpactTopHeaderProps {
  onOpenGuide?: () => void;
}

export function ImpactTopHeader({ onOpenGuide }: ImpactTopHeaderProps) {
  const { profilePhotoDisplayUri } = useUserAvatar();

  return (
    <View style={styles.row}>
      <View style={styles.sideSpacer} accessibilityElementsHidden importantForAccessibility="no" />
      <View style={styles.logoSlot}>
        <RippleHeaderLogo />
      </View>
      <View style={styles.right}>
        {onOpenGuide ? (
          <Pressable
            style={rippleGlass.chromeButton}
            accessibilityRole="button"
            accessibilityLabel="Impact guide"
            onPress={onOpenGuide}>
            <SymbolView
              name={{ ios: 'sparkles', android: 'star', web: 'star' }}
              size={17}
              tintColor="#4A5568"
            />
          </Pressable>
        ) : null}
        {profilePhotoDisplayUri ? (
          <Image
            source={{ uri: profilePhotoDisplayUri }}
            style={styles.avatar}
            contentFit="cover"
            accessibilityLabel="Your profile picture"
          />
        ) : (
          <View style={styles.avatarPlaceholder} accessibilityElementsHidden />
        )}
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
    marginBottom: 4,
  },
  sideSpacer: {
    width: 40,
    height: 40,
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
    minWidth: 40,
    justifyContent: 'flex-end',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  avatarPlaceholder: {
    width: 36,
    height: 36,
  },
});
