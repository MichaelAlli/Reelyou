import { memo, useState } from 'react';
import { Modal, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { TravelerAvatarFigure } from '@/components/starpath/TravelerAvatarFigure';
import { StarPathGlass, starpathCardShadow } from '@/components/starpath/starpathGlass';
import { Fonts } from '@/constants/theme';
import { REELYOU_AVATAR_PRESETS } from '@/identity/avatarPresets';
import {
  DEFAULT_CUSTOM_AVATAR,
  type CustomAvatarConfig,
  type UserAvatarIdentity,
} from '@/identity/userAvatarTypes';
import type { StarPathThemeTokens } from '@/starpath/starpathTheme';

interface StarPathAvatarIdentitySheetProps {
  visible: boolean;
  theme: StarPathThemeTokens;
  identity: UserAvatarIdentity;
  profilePhotoUri?: string | null;
  onClose: () => void;
  onSelectProfilePhoto: () => void;
  onSelectPreset: (id: string) => void;
  onSaveCustom: (config: CustomAvatarConfig) => void;
  onUseSilhouette: () => void;
}

function StarPathAvatarIdentitySheetComponent({
  visible,
  theme,
  identity,
  profilePhotoUri,
  onClose,
  onSelectProfilePhoto,
  onSelectPreset,
  onSaveCustom,
  onUseSilhouette,
}: StarPathAvatarIdentitySheetProps) {
  const [draft, setDraft] = useState<CustomAvatarConfig>(
    identity.customAvatarConfig ?? DEFAULT_CUSTOM_AVATAR,
  );

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={styles.sheet} testID="starpath-avatar-sheet">
        <Text style={[styles.title, { color: theme.labelBright }]}>Your traveler</Text>
        <Text style={[styles.sub, { color: theme.labelMuted }]}>Choose how you appear on Starpath.</Text>

        <View style={styles.preview}>
          <TravelerAvatarFigure identity={{ ...identity, customAvatarConfig: draft }} size={72} />
        </View>

        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
          <Pressable style={styles.row} onPress={onSelectProfilePhoto}>
            <Text style={[styles.rowLabel, { color: theme.labelBright }]}>Use profile photo</Text>
            <Text style={[styles.rowHint, { color: theme.labelMuted }]}>
              {profilePhotoUri ? 'Available' : 'Add a photo in Profile first'}
            </Text>
          </Pressable>

          <Text style={[styles.section, { color: theme.labelMuted }]}>Preset avatars</Text>
          <View style={styles.presetRow}>
            {REELYOU_AVATAR_PRESETS.map((p) => (
              <Pressable
                key={p.id}
                onPress={() => onSelectPreset(p.id)}
                style={[
                  styles.preset,
                  identity.avatarAssetId === p.id && styles.presetActive,
                ]}
              >
                <View style={[styles.presetSwatch, { backgroundColor: p.gradientTop }]} />
                <Text style={[styles.presetLabel, { color: theme.labelBright }]}>{p.label}</Text>
              </Pressable>
            ))}
          </View>

          <Text style={[styles.section, { color: theme.labelMuted }]}>Customize</Text>
          <OptionRow
            label="Skin tone"
            options={['#F5D0A9', '#C68642', '#8D5524', '#3D2B1F']}
            value={draft.skinTone}
            onPick={(skinTone) => setDraft((d) => ({ ...d, skinTone }))}
          />
          <OptionRow
            label="Hair"
            options={['#2A1F1A', '#6B4F3A', '#D4AF37', '#E8E8E8']}
            value={draft.hairColor}
            onPick={(hairColor) => setDraft((d) => ({ ...d, hairColor }))}
          />
          <OptionRow
            label="Clothing"
            options={['#3D3566', '#1E3A5F', '#4A3728', '#2F4F4F']}
            value={draft.clothingColor}
            onPick={(clothingColor) => setDraft((d) => ({ ...d, clothingColor }))}
          />
          <Pressable
            style={styles.applyCustom}
            onPress={() => {
              onSaveCustom(draft);
              onClose();
            }}
          >
            <Text style={[styles.applyText, { color: theme.pathGold }]}>Use custom avatar</Text>
          </Pressable>

          <Pressable onPress={onUseSilhouette} style={styles.row}>
            <Text style={[styles.rowLabel, { color: theme.labelMuted }]}>Use default traveler</Text>
          </Pressable>
        </ScrollView>

        <Pressable onPress={onClose} style={styles.done}>
          <Text style={[styles.doneText, { color: theme.labelBright }]}>Done</Text>
        </Pressable>
      </View>
    </Modal>
  );
}

function OptionRow({
  label,
  options,
  value,
  onPick,
}: {
  label: string;
  options: string[];
  value: string;
  onPick: (v: string) => void;
}) {
  return (
    <View style={styles.optionBlock}>
      <Text style={styles.optionLabel}>{label}</Text>
      <View style={styles.swatches}>
        {options.map((c) => (
          <Pressable
            key={c}
            onPress={() => onPick(c)}
            style={[styles.swatch, { backgroundColor: c }, value === c && styles.swatchOn]}
          />
        ))}
      </View>
    </View>
  );
}

export const StarPathAvatarIdentitySheet = memo(StarPathAvatarIdentitySheetComponent);

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(2, 4, 12, 0.5)',
  },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    maxHeight: '78%',
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    backgroundColor: StarPathGlass.cardBg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: StarPathGlass.cardBorder,
    paddingTop: 16,
    ...starpathCardShadow,
  },
  title: {
    fontFamily: Fonts.sans,
    fontSize: 17,
    fontWeight: '700',
    textAlign: 'center',
  },
  sub: {
    fontFamily: Fonts.sans,
    fontSize: 11,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 8,
  },
  preview: {
    alignItems: 'center',
    marginVertical: 8,
  },
  scroll: {
    maxHeight: 360,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 10,
  },
  row: {
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,244,214,0.12)',
  },
  rowLabel: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    fontWeight: '600',
  },
  rowHint: {
    fontFamily: Fonts.sans,
    fontSize: 10,
    marginTop: 2,
  },
  section: {
    fontFamily: Fonts.sans,
    fontSize: 9,
    letterSpacing: 1.1,
    fontWeight: '700',
    marginTop: 8,
    ...(Platform.OS === 'android' ? { includeFontPadding: false } : null),
  },
  presetRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  preset: {
    width: 72,
    alignItems: 'center',
    padding: 6,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'transparent',
  },
  presetActive: {
    borderColor: 'rgba(232, 200, 114, 0.5)',
  },
  presetSwatch: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginBottom: 4,
  },
  presetLabel: {
    fontFamily: Fonts.sans,
    fontSize: 9,
    fontWeight: '600',
  },
  optionBlock: {
    gap: 6,
  },
  optionLabel: {
    fontFamily: Fonts.sans,
    fontSize: 10,
    color: 'rgba(196, 168, 255, 0.85)',
  },
  swatches: {
    flexDirection: 'row',
    gap: 8,
  },
  swatch: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  swatchOn: {
    borderColor: '#E8C872',
  },
  applyCustom: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  applyText: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    fontWeight: '700',
  },
  done: {
    alignItems: 'center',
    paddingVertical: 14,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255,244,214,0.12)',
  },
  doneText: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    fontWeight: '600',
  },
});
