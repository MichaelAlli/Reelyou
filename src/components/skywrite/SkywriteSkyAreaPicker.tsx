import { useMemo, useState, type ReactNode } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { AddCustomSkyAreaInline } from '@/components/skyAreas/AddCustomSkyAreaInline';
import { SkyAreaSelectChip } from '@/components/skyAreas/SkyAreaSelectChip';
import { SkywriteCopy } from '@/constants/skywriteCopy';
import { Fonts, Radius } from '@/constants/theme';
import type { SkyArea } from '@/skyAreas/skyAreaDefinition';
import { useSkyAreaPreferences } from '@/skyAreas/SkyAreaPreferencesProvider';

interface SkywriteSkyAreaPickerProps {
  value: string | undefined;
  onChange: (id: string) => void;
  recentIds?: readonly string[];
}

export function SkywriteSkyAreaPicker({ value, onChange, recentIds = [] }: SkywriteSkyAreaPickerProps) {
  const { catalog, filterCatalog, selectedIds, addCustomArea, isAreaSelected } = useSkyAreaPreferences();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  const selectedArea = useMemo(
    () => catalog.find((area) => area.id === value),
    [catalog, value],
  );

  const selectedAreas = useMemo(
    () => catalog.filter((area) => isAreaSelected(area.id)),
    [catalog, isAreaSelected],
  );

  const recentAreas = useMemo(() => {
    const ids = recentIds.length > 0 ? recentIds : selectedIds;
    return ids
      .map((id) => catalog.find((area) => area.id === id))
      .filter((area): area is SkyArea => Boolean(area));
  }, [catalog, recentIds, selectedIds]);

  const suggested = useMemo(() => catalog.filter((area) => area.source === 'default'), [catalog]);
  const filtered = useMemo(() => filterCatalog(query), [filterCatalog, query]);

  const pick = (id: string) => {
    onChange(id);
    setOpen(false);
    setQuery('');
  };

  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>{SkywriteCopy.shareInAreaTitle}</Text>
      <Text style={styles.hint}>{SkywriteCopy.shareInAreaHint}</Text>
      <Pressable
        accessibilityRole="button"
        onPress={() => setOpen(true)}
        style={styles.selector}>
        <Text style={styles.selectorLabel}>
          {selectedArea?.label ?? 'Choose a Sky Area'}
        </Text>
        <Text style={styles.selectorChevron}>⌄</Text>
      </Pressable>

      <Modal visible={open} animationType="slide" transparent onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <Pressable style={styles.sheet} onPress={(event) => event.stopPropagation()}>
            <Text style={styles.sheetTitle}>Share this in…</Text>
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Search areas"
              placeholderTextColor="rgba(235,228,248,0.45)"
              style={styles.search}
            />
            <ScrollView style={styles.scroll} keyboardShouldPersistTaps="handled">
              {selectedAreas.length > 0 ? (
                <Section title="Your selected areas">
                  <ChipRow areas={selectedAreas} value={value} onPick={pick} />
                </Section>
              ) : null}
              {recentAreas.length > 0 ? (
                <Section title="Recent">
                  <ChipRow areas={recentAreas} value={value} onPick={pick} />
                </Section>
              ) : null}
              <Section title="Suggested">
                <ChipRow areas={suggested} value={value} onPick={pick} />
              </Section>
              {query.trim().length > 0 ? (
                <Section title="Search results">
                  <ChipRow areas={filtered} value={value} onPick={pick} />
                  {filtered.length === 0 ? (
                    <AddCustomSkyAreaInline
                      buttonLabel={`+ Create “${query.trim()}”`}
                      onAdd={(label) => {
                        const result = addCustomArea(label || query.trim());
                        if (result.error) return result.error;
                        if (result.areaId) pick(result.areaId);
                        return null;
                      }}
                    />
                  ) : null}
                </Section>
              ) : (
                <AddCustomSkyAreaInline
                  onAdd={(label) => {
                    const result = addCustomArea(label);
                    if (result.error) return result.error;
                    if (result.areaId) pick(result.areaId);
                    return null;
                  }}
                />
              )}
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

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function ChipRow({
  areas,
  value,
  onPick,
}: {
  areas: readonly SkyArea[];
  value: string | undefined;
  onPick: (id: string) => void;
}) {
  return (
    <View style={styles.row}>
      {areas.map((area) => (
        <SkyAreaSelectChip
          key={area.id}
          area={area}
          selected={value === area.id}
          onPress={() => onPick(area.id)}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 8, marginTop: 12 },
  title: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    fontWeight: '700',
    color: '#E8C872',
    letterSpacing: 0.3,
  },
  hint: {
    fontFamily: Fonts.sans,
    fontSize: 11.5,
    lineHeight: 16,
    color: 'rgba(235,228,248,0.62)',
  },
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 48,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: 'rgba(232, 200, 114, 0.45)',
    backgroundColor: 'rgba(212, 175, 55, 0.08)',
    paddingHorizontal: 16,
  },
  selectorLabel: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    fontWeight: '600',
    color: '#F5F0FF',
  },
  selectorChevron: { color: '#E8C872', fontSize: 16 },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'flex-end',
  },
  sheet: {
    maxHeight: '82%',
    backgroundColor: '#0C1018',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    gap: 10,
  },
  sheetTitle: {
    fontFamily: Fonts.serif,
    fontSize: 20,
    color: '#F5F0FF',
    textAlign: 'center',
  },
  search: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(235,228,248,0.18)',
    backgroundColor: 'rgba(8,12,22,0.55)',
    paddingHorizontal: 14,
    paddingVertical: 12,
    minHeight: 44,
    fontFamily: Fonts.sans,
    fontSize: 14,
    color: '#F5F0FF',
  },
  scroll: { maxHeight: 420 },
  section: { gap: 8, marginBottom: 14 },
  sectionTitle: {
    fontFamily: Fonts.sans,
    fontSize: 11,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: 'rgba(235,228,248,0.5)',
  },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  done: { alignSelf: 'center', minHeight: 44, justifyContent: 'center', paddingHorizontal: 20 },
  doneText: { fontFamily: Fonts.sans, fontSize: 14, fontWeight: '600', color: '#E8C872' },
});
