import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Radius } from '@/constants/theme';
import { useThemedStyles } from '@/theme/useTheme';

interface FloatingCreateButtonProps {
  onPress: () => void;
}

export function FloatingCreateButton({ onPress }: FloatingCreateButtonProps) {
  const styles = useThemedStyles((tokens) =>
    StyleSheet.create({
      wrapper: {
        alignItems: 'center',
        marginTop: -28,
        flex: 1,
      },
      button: {
        width: 56,
        height: 56,
        borderRadius: Radius.full,
        backgroundColor: tokens.primaryAction,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: tokens.primaryAction,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 16,
        elevation: 10,
        borderWidth: 2,
        borderColor: tokens.goldLight,
      },
      icon: {
        fontSize: 28,
        fontWeight: '300',
        color: tokens.appBackground,
        marginTop: -2,
      },
      label: {
        fontSize: 11,
        fontWeight: '600',
        color: tokens.primaryAction,
        marginTop: 4,
      },
      pressed: {
        opacity: 0.9,
        transform: [{ scale: 0.95 }],
      },
    }),
  );

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.wrapper, pressed && styles.pressed]}>
      <View style={styles.button}>
        <Text style={styles.icon}>+</Text>
      </View>
      <Text style={styles.label}>Create</Text>
    </Pressable>
  );
}
