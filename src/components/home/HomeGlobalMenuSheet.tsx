import { useRouter } from 'expo-router';
import { memo } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { HomePalette } from '@/constants/homeLayout';
import { Fonts } from '@/constants/theme';
import { useReelyouConnect } from '@/connect/ReelyouConnectProvider';
import { isDevRuntime } from '@/constants/devFlags';
import {
  buildVisitorProfileHref,
  VISITOR_PROFILE_QA_OWNER_ID,
} from '@/profile/visitorProfileRoute';
interface HomeGlobalMenuSheetProps {
  visible: boolean;
  onClose: () => void;
}

function HomeGlobalMenuSheetComponent({ visible, onClose }: HomeGlobalMenuSheetProps) {
  const router = useRouter();
  const { messages } = useReelyouConnect();
  const unreadMessages = messages.unreadThreadIds.length > 0;

  const go = (path: string) => {
    onClose();
    router.push(path as never);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel="Close menu" />
      <View style={styles.sheet} testID="home-global-menu">
        <MenuRow
          label="Messages"
          hint={unreadMessages ? 'Unread' : undefined}
          onPress={() => go('/messages')}
        />
        <MenuRow label="Profile / Me" onPress={() => go('/profile')} />
        <MenuRow label="Settings" onPress={() => go('/settings')} />
        <MenuRow label="Privacy & Visibility" onPress={() => go('/settings/privacy')} />
        <MenuRow label="Theme / Appearance" onPress={() => go('/settings')} />
        <MenuRow label="Help / Support" onPress={() => go('/settings/help')} />
        {isDevRuntime() ? (
          <MenuRow
            label="QA: Visitor Profile (Jordan)"
            onPress={() => go(buildVisitorProfileHref(VISITOR_PROFILE_QA_OWNER_ID))}
          />
        ) : null}
        <MenuRow label="Account / Sign out" onPress={() => go('/login')} muted />
        <Pressable onPress={onClose} accessibilityLabel="Close menu" style={styles.done}>
          <Text style={styles.doneText}>Close</Text>
        </Pressable>
      </View>
    </Modal>
  );
}

function MenuRow({
  label,
  hint,
  onPress,
  muted,
}: {
  label: string;
  hint?: string;
  onPress: () => void;
  muted?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
      accessibilityRole="button"
      accessibilityLabel={hint ? `${label}. ${hint}` : label}
    >
      <Text style={[styles.rowText, muted && styles.muted]}>{label}</Text>
      {hint ? <View style={styles.dot} accessibilityLabel="Unread indicator" /> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  backdrop: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(2, 4, 12, 0.55)' },
  sheet: {
    position: 'absolute',
    left: 16,
    top: 72,
    width: 220,
    borderRadius: 16,
    backgroundColor: 'rgba(8, 10, 28, 0.96)',
    borderWidth: 1,
    borderColor: 'rgba(232, 200, 114, 0.22)',
    paddingVertical: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 44,
  },
  rowText: { fontFamily: Fonts.sans, fontSize: 14, fontWeight: '600', color: HomePalette.textPrimary },
  muted: { color: 'rgba(235, 228, 248, 0.65)', fontWeight: '500' },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: HomePalette.goldBright,
  },
  pressed: { opacity: 0.88 },
  done: { alignItems: 'center', paddingVertical: 10 },
  doneText: { fontFamily: Fonts.sans, fontSize: 12, color: HomePalette.goldBright },
});

export const HomeGlobalMenuSheet = memo(HomeGlobalMenuSheetComponent);
