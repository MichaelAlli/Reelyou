import { memo } from 'react';
import { Modal, Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { StarPathGlass, StarPathTypography, starpathCardShadow } from '@/components/starpath/starpathGlass';
import { Fonts } from '@/constants/theme';
import type { StarPathThemeTokens } from '@/starpath/starpathTheme';
import type { StarPathNodeCatalogEntry } from '@/starpath/starpathNodeCatalog';
import type { StarPathNodeUiState } from '@/starpath/starpathInteractionTypes';

interface StarPathNodeDetailSheetProps {
  visible: boolean;
  theme: StarPathThemeTokens;
  entry: StarPathNodeCatalogEntry | null;
  uiState: StarPathNodeUiState;
  onClose: () => void;
  onExplore: () => void;
  onInterested: () => void;
  onDismiss: () => void;
  onSave: () => void;
  onUndoDismiss?: () => void;
}

function StarPathNodeDetailSheetComponent({
  visible,
  theme,
  entry,
  uiState,
  onClose,
  onExplore,
  onInterested,
  onDismiss,
  onSave,
  onUndoDismiss,
}: StarPathNodeDetailSheetProps) {
  if (!entry) return null;

  const showUndo = uiState === 'dismissed' && onUndoDismiss;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel="Close detail" />
      <View style={styles.anchor} pointerEvents="box-none">
        <View style={styles.panel} testID="starpath-node-detail">
          <Text style={[styles.kicker, { color: theme.labelMuted }]}>{entry.subtitle.toUpperCase()}</Text>
          <Text style={[styles.title, { color: theme.labelBright }]}>{entry.title}</Text>
          <Text style={[styles.body, { color: StarPathTypography.mutedLilac }]}>{entry.whyItMatters}</Text>
          <Text style={[styles.prompt, { color: theme.labelMuted }]}>What is this? A moment on your Starpath.</Text>

          <View style={styles.actions}>
            {entry.actions.explore ? (
              <ActionChip label="Explore" onPress={onExplore} theme={theme} primary />
            ) : null}
            {entry.actions.interested && uiState !== 'interested' ? (
              <ActionChip label="Interested" onPress={onInterested} theme={theme} />
            ) : null}
            {entry.actions.save ? (
              <ActionChip label="Save for later" onPress={onSave} theme={theme} />
            ) : null}
            {entry.actions.dismiss && uiState !== 'dismissed' ? (
              <ActionChip label="Not for me" onPress={onDismiss} theme={theme} muted />
            ) : null}
            {showUndo ? (
              <ActionChip label="Bring back" onPress={onUndoDismiss} theme={theme} />
            ) : null}
          </View>

          <Pressable onPress={onClose} style={styles.close} accessibilityRole="button" accessibilityLabel="Close">
            <Text style={[styles.closeText, { color: theme.labelBright }]}>Close</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

function ActionChip({
  label,
  onPress,
  theme,
  primary,
  muted,
}: {
  label: string;
  onPress: () => void;
  theme: StarPathThemeTokens;
  primary?: boolean;
  muted?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        primary && { borderColor: theme.pathGold },
        muted && styles.chipMuted,
        pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] },
      ]}
    >
      <Text style={[styles.chipText, { color: primary ? theme.pathGold : theme.labelBright }]}>{label}</Text>
    </Pressable>
  );
}

export const StarPathNodeDetailSheet = memo(StarPathNodeDetailSheetComponent);

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(2, 4, 12, 0.45)',
  },
  anchor: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    paddingBottom: 120,
  },
  panel: {
    borderRadius: StarPathGlass.cardRadius,
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: StarPathGlass.cardBg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: StarPathGlass.cardBorder,
    gap: 8,
    ...starpathCardShadow,
  },
  kicker: {
    fontFamily: Fonts.sans,
    fontSize: 8,
    letterSpacing: 1.2,
    fontWeight: '700',
    ...(Platform.OS === 'android' ? { includeFontPadding: false } : null),
  },
  title: {
    fontFamily: Fonts.sans,
    fontSize: 16,
    fontWeight: '700',
  },
  body: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    lineHeight: 17,
  },
  prompt: {
    fontFamily: Fonts.sans,
    fontSize: 10,
    lineHeight: 14,
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255, 244, 214, 0.22)',
    backgroundColor: 'rgba(3, 5, 14, 0.65)',
  },
  chipMuted: {
    borderColor: 'rgba(196, 168, 255, 0.2)',
  },
  chipText: {
    fontFamily: Fonts.sans,
    fontSize: 11,
    fontWeight: '600',
  },
  close: {
    alignSelf: 'center',
    marginTop: 6,
    padding: 8,
  },
  closeText: {
    fontFamily: Fonts.sans,
    fontSize: 11,
    fontWeight: '600',
  },
});
