import { memo, useCallback, useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Fonts, Radius } from '@/constants/theme';
import {
  SKY_AREA_CATEGORIES,
  type SkyAreaCategoryId,
} from '@/skyAreas/skyAreaCategory';
import { PROFILE_SKY_AREA_SHORTCUT_COUNT } from '@/profile/profileSkyAreaShortcutsPersistence';

interface ProfileSkyAreaShortcutsSheetProps {
  visible: boolean;
  selectedIds: readonly SkyAreaCategoryId[];
  onClose: () => void;
  onSave: (ids: SkyAreaCategoryId[]) => void;
}

function ProfileSkyAreaShortcutsSheetComponent({
  visible,
  selectedIds,
  onClose,
  onSave,
}: ProfileSkyAreaShortcutsSheetProps) {
  const [draft, setDraft] = useState<SkyAreaCategoryId[]>(() => [...selectedIds]);

  const open = useCallback(() => {
    setDraft([...selectedIds]);
  }, [selectedIds]);

  const toggle = useCallback((id: SkyAreaCategoryId) => {
    setDraft((current) => {
      if (current.includes(id)) {
        return current.filter((entry) => entry !== id);
      }
      if (current.length >= PROFILE_SKY_AREA_SHORTCUT_COUNT) {
        return [...current.slice(1), id];
      }
      return [...current, id];
    });
  }, []);

  const canSave = draft.length === PROFILE_SKY_AREA_SHORTCUT_COUNT;

  const sortedCategories = useMemo(
    () => [...SKY_AREA_CATEGORIES].sort((a, b) => a.sortOrder - b.sortOrder),
    [],
  );

  if (!visible) return null;

  return (
    <Modal visible transparent animationType="fade" onShow={open} onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={(event) => event.stopPropagation()}>
          <Text style={styles.title}>Quick filter areas</Text>
          <Text style={styles.subtitle}>
            Choose {PROFILE_SKY_AREA_SHORTCUT_COUNT} Sky areas beside All. This only changes shortcuts —
            not how posts are categorized.
          </Text>
          <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
            {sortedCategories.map((area) => {
              const active = draft.includes(area.id);
              const order = active ? draft.indexOf(area.id) + 1 : null;
              return (
                <Pressable
                  key={area.id}
                  accessibilityRole="button"
                  accessibilityState={{ selected: active }}
                  onPress={() => toggle(area.id)}
                  style={[styles.option, active && styles.optionActive]}>
                  <Text style={[styles.optionLabel, active && styles.optionLabelActive]}>
                    {area.label}
                  </Text>
                  {order ? <Text style={styles.orderBadge}>{order}</Text> : null}
                </Pressable>
              );
            })}
          </ScrollView>
          <View style={styles.actions}>
            <Pressable onPress={onClose} style={styles.secondaryBtn}>
              <Text style={styles.secondaryText}>Cancel</Text>
            </Pressable>
            <Pressable
              disabled={!canSave}
              onPress={() => {
                onSave(draft);
                onClose();
              }}
              style={[styles.primaryBtn, !canSave && styles.primaryDisabled]}>
              <Text style={styles.primaryText}>Save</Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

export const ProfileSkyAreaShortcutsSheet = memo(ProfileSkyAreaShortcutsSheetComponent);

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(4, 6, 16, 0.72)',
    justifyContent: 'flex-end',
  },
  sheet: {
    maxHeight: '78%',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    backgroundColor: 'rgba(8, 10, 28, 0.98)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(232, 200, 114, 0.28)',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
  },
  title: {
    fontFamily: Fonts.serif,
    fontSize: 20,
    color: '#FFF8F0',
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    lineHeight: 17,
    color: 'rgba(248, 244, 236, 0.65)',
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 12,
  },
  list: { maxHeight: 360 },
  listContent: { gap: 8, paddingBottom: 8 },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: Radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(167, 139, 250, 0.22)',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  optionActive: {
    borderColor: 'rgba(232, 200, 114, 0.48)',
    backgroundColor: 'rgba(232, 200, 114, 0.1)',
  },
  optionLabel: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    color: 'rgba(248, 244, 236, 0.78)',
  },
  optionLabelActive: {
    color: '#FFF8F0',
    fontWeight: '600',
  },
  orderBadge: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    fontWeight: '700',
    color: '#E8C872',
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },
  secondaryBtn: {
    flex: 1,
    minHeight: 44,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: 'rgba(232, 200, 114, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryText: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    fontWeight: '600',
    color: '#E8C872',
  },
  primaryBtn: {
    flex: 1,
    minHeight: 44,
    borderRadius: Radius.full,
    backgroundColor: '#E8C872',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryDisabled: { opacity: 0.45 },
  primaryText: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    fontWeight: '700',
    color: '#1a1028',
  },
});
