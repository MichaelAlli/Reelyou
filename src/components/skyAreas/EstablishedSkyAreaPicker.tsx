import { useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { SkyAreaSelectChip } from '@/components/skyAreas/SkyAreaSelectChip';
import { Fonts } from '@/constants/theme';
import type { SkyArea } from '@/skyAreas/skyAreaDefinition';

interface EstablishedSkyAreaPickerProps {
  areas: readonly SkyArea[];
  selectedIds: readonly string[];
  onToggle: (skyAreaId: string) => void;
  placeholder?: string;
  accessibilityLabel?: string;
}

export function EstablishedSkyAreaPicker({
  areas,
  selectedIds,
  onToggle,
  placeholder = 'Search and select areas',
  accessibilityLabel = 'Search established Sky Areas',
}: EstablishedSkyAreaPickerProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  const selectedAreas = useMemo(
    () => areas.filter((area) => selectedIds.includes(area.id)),
    [areas, selectedIds],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return areas.slice(0, 40);
    return areas.filter((area) => area.label.toLowerCase().includes(q)).slice(0, 40);
  }, [areas, query]);

  return (
    <View style={styles.wrap}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        onPress={() => setOpen(true)}
        style={({ pressed }) => [styles.field, pressed && { opacity: 0.92 }]}>
        <Text style={styles.fieldText} numberOfLines={1}>
          {placeholder}
        </Text>
        <Text style={styles.chevron}>▼</Text>
      </Pressable>

      {selectedAreas.length > 0 ? (
        <View style={styles.chipRow}>
          {selectedAreas.map((area) => (
            <SkyAreaSelectChip
              key={area.id}
              area={area}
              selected
              onPress={() => onToggle(area.id)}
            />
          ))}
        </View>
      ) : null}

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <Pressable style={styles.sheet} onPress={(event) => event.stopPropagation()}>
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Search areas…"
              placeholderTextColor="rgba(235,228,248,0.45)"
              style={styles.search}
              autoFocus
            />
            <ScrollView keyboardShouldPersistTaps="handled" style={styles.list}>
              {filtered.map((area) => {
                const selected = selectedIds.includes(area.id);
                return (
                  <Pressable
                    key={area.id}
                    accessibilityRole="button"
                    onPress={() => onToggle(area.id)}
                    style={({ pressed }) => [
                      styles.option,
                      selected && styles.optionSelected,
                      pressed && { opacity: 0.88 },
                    ]}>
                    <Text style={styles.optionText}>{area.label}</Text>
                    {selected ? <Text style={styles.check}>×</Text> : null}
                  </Pressable>
                );
              })}
            </ScrollView>
            <Pressable onPress={() => setOpen(false)} style={styles.done}>
              <Text style={styles.doneText}>Done</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 10 },
  field: {
    minHeight: 44,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(235,228,248,0.18)',
    backgroundColor: 'rgba(8,12,22,0.55)',
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  fieldText: { flex: 1, fontFamily: Fonts.sans, fontSize: 14, color: 'rgba(235,228,248,0.72)' },
  chevron: { fontFamily: Fonts.sans, fontSize: 11, color: '#E8C872' },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(4,6,12,0.72)',
    justifyContent: 'center',
    padding: 20,
  },
  sheet: {
    maxHeight: '78%',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(232,200,114,0.35)',
    backgroundColor: '#0a0f18',
    padding: 14,
    gap: 10,
  },
  search: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(235,228,248,0.18)',
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontFamily: Fonts.sans,
    fontSize: 14,
    color: '#F5F0FF',
  },
  list: { maxHeight: 320 },
  option: {
    minHeight: 44,
    paddingHorizontal: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  optionSelected: { backgroundColor: 'rgba(212,175,55,0.08)' },
  optionText: { fontFamily: Fonts.sans, fontSize: 14, color: '#F5F0FF' },
  check: { fontFamily: Fonts.sans, fontSize: 18, color: '#E8C872' },
  done: { alignSelf: 'flex-end', minHeight: 44, justifyContent: 'center', paddingHorizontal: 8 },
  doneText: { fontFamily: Fonts.sans, fontSize: 14, fontWeight: '600', color: '#E8C872' },
});
