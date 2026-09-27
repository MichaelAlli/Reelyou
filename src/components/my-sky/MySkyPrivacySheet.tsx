import { memo } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MySkyPrivacyControls } from '@/components/my-sky/MySkyPrivacyControls';
import { MySkyCopy } from '@/constants/mySkyCopy';
import { Fonts, Radius, Spacing } from '@/constants/theme';
import type { SkyVisibilitySettings } from '@/mySky/skyVisibilitySettings';
import { useThemedStyles } from '@/theme/useTheme';

interface MySkyPrivacySheetProps {
  visible: boolean;
  settings: SkyVisibilitySettings;
  onClose: () => void;
  onChange: (settings: SkyVisibilitySettings) => void;
}

function MySkyPrivacySheetComponent({
  visible,
  settings,
  onClose,
  onChange,
}: MySkyPrivacySheetProps) {
  const styles = useThemedStyles((tokens) =>
    StyleSheet.create({
      backdrop: {
        flex: 1,
        backgroundColor: 'rgba(4, 6, 16, 0.72)',
        justifyContent: 'flex-end',
      },
      sheet: {
        maxHeight: '88%',
        borderTopLeftRadius: Radius.xl,
        borderTopRightRadius: Radius.xl,
        backgroundColor: 'rgba(10, 12, 28, 0.98)',
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: 'rgba(167, 139, 250, 0.22)',
      },
      header: {
        paddingHorizontal: Spacing.lg,
        paddingTop: Spacing.md,
        paddingBottom: Spacing.sm,
        gap: 4,
      },
      title: {
        fontFamily: Fonts.serif,
        fontSize: 22,
        fontWeight: '600',
        color: tokens.primaryText,
      },
      subtitle: {
        fontFamily: Fonts.sans,
        fontSize: 13,
        lineHeight: 18,
        color: tokens.secondaryText,
      },
      scroll: {
        paddingHorizontal: Spacing.lg,
      },
      closeRow: {
        paddingHorizontal: Spacing.lg,
        paddingBottom: Spacing.md,
      },
      closeBtn: {
        minHeight: 44,
        alignItems: 'center',
        justifyContent: 'center',
      },
      closeText: {
        fontFamily: Fonts.sans,
        fontSize: 15,
        fontWeight: '600',
        color: tokens.gold,
      },
    }),
  );

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={(event) => event.stopPropagation()}>
          <SafeAreaView edges={['bottom']}>
            <View style={styles.header}>
              <Text style={styles.title}>{MySkyCopy.privacyTitle}</Text>
              <Text style={styles.subtitle}>{MySkyCopy.privacySubtitle}</Text>
            </View>

            <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
              <MySkyPrivacyControls settings={settings} onChange={onChange} />
            </ScrollView>

            <View style={styles.closeRow}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={MySkyCopy.searchClose}
                onPress={onClose}
                style={styles.closeBtn}>
                <Text style={styles.closeText}>{MySkyCopy.searchClose}</Text>
              </Pressable>
            </View>
          </SafeAreaView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

export const MySkyPrivacySheet = memo(MySkyPrivacySheetComponent);
