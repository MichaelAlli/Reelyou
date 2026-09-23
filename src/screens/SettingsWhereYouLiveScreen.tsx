import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SkyAreaSelectChip } from '@/components/skyAreas/SkyAreaSelectChip';
import { Fonts } from '@/constants/theme';
import { useSkyAreaPreferences } from '@/skyAreas/SkyAreaPreferencesProvider';

export function SettingsWhereYouLiveScreen() {
  const router = useRouter();
  const {
    catalog,
    filterCatalog,
    isAreaSelected,
    toggleAreaSelection,
    setBeaconEnabled,
    setPauseAllBeacons,
    setDiscovering,
    record,
    addCustomArea,
  } = useSkyAreaPreferences();
  const [searchQuery, setSearchQuery] = useState('');
  const [customLabel, setCustomLabel] = useState('');
  const [customError, setCustomError] = useState<string | null>(null);

  const visibleAreas = useMemo(() => filterCatalog(searchQuery), [filterCatalog, searchQuery]);

  const selectedAreas = useMemo(
    () => catalog.filter((area) => isAreaSelected(area.id)),
    [catalog, isAreaSelected],
  );

  const handleAddCustom = () => {
    const error = addCustomArea(customLabel);
    if (error) {
      setCustomError(error);
      return;
    }
    setCustomError(null);
    setCustomLabel('');
  };

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} accessibilityLabel="Back">
          <Text style={styles.back}>Back</Text>
        </Pressable>
        <Text style={styles.title}>Where I Live in the Sky</Text>
        <View style={styles.spacer} />
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.lead}>
          Areas you’ve lived, learned, explored, or grown through. These preferences stay private
          unless you choose to share them later.
        </Text>

        <View style={styles.panel}>
          <ToggleRow
            label="Pause all contribution beacons"
            hint="Keeps your selected areas — only pauses beaconed Skywrites."
            value={record.pauseAllBeacons}
            onValueChange={setPauseAllBeacons}
          />
          <ToggleRow
            label="I’m still discovering"
            hint="You can add areas anytime."
            value={record.stillDiscovering}
            onValueChange={setDiscovering}
          />
        </View>

        {selectedAreas.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Your selected areas</Text>
            {selectedAreas.map((area) => {
              const pref = record.preferences.find((entry) => entry.skyAreaId === area.id);
              const beaconOn = pref?.beaconEnabled !== false;
              return (
                <View key={area.id} style={styles.selectedRow}>
                  <View style={styles.selectedMeta}>
                    <Text style={styles.selectedLabel}>{area.label}</Text>
                    <Text style={styles.beaconHint}>Beaconed Skywrites</Text>
                  </View>
                  <Switch
                    value={!record.pauseAllBeacons && beaconOn}
                    onValueChange={(v) => setBeaconEnabled(area.id, v)}
                    disabled={record.pauseAllBeacons}
                    accessibilityLabel={`Beaconed Skywrites for ${area.label}`}
                  />
                  <Pressable
                    onPress={() => toggleAreaSelection(area.id)}
                    accessibilityLabel={`Remove ${area.label}`}
                    style={styles.removeButton}>
                    <Text style={styles.removeText}>Remove</Text>
                  </Pressable>
                </View>
              );
            })}
          </View>
        ) : (
          <Text style={styles.empty}>No areas selected yet.</Text>
        )}

        <Text style={styles.sectionTitle}>Add areas</Text>
        <TextInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search areas"
          placeholderTextColor="rgba(235,228,248,0.45)"
          style={styles.search}
        />
        <View style={styles.chipGrid}>
          {visibleAreas.map((area) => (
            <SkyAreaSelectChip
              key={area.id}
              area={area}
              selected={isAreaSelected(area.id)}
              onPress={() => toggleAreaSelection(area.id)}
            />
          ))}
        </View>

        <View style={styles.customBlock}>
          <Text style={styles.sectionTitle}>Create a custom area</Text>
          <Text style={styles.customHint}>
            For lived experiences that don’t fit a starter label — you stay in control.
          </Text>
          <TextInput
            value={customLabel}
            onChangeText={(text) => {
              setCustomLabel(text);
              setCustomError(null);
            }}
            placeholder="e.g. Single fatherhood"
            placeholderTextColor="rgba(235,228,248,0.45)"
            style={styles.search}
          />
          {customError ? (
            <Text accessibilityRole="alert" style={styles.error}>
              {customError}
            </Text>
          ) : null}
          <Pressable
            onPress={handleAddCustom}
            style={({ pressed }) => [styles.addButton, pressed && { opacity: 0.88 }]}>
            <Text style={styles.addButtonText}>Add custom area</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function ToggleRow({
  label,
  hint,
  value,
  onValueChange,
}: {
  label: string;
  hint?: string;
  value: boolean;
  onValueChange: (v: boolean) => void;
}) {
  return (
    <View style={styles.toggleRow}>
      <View style={styles.toggleCopy}>
        <Text style={styles.toggleLabel}>{label}</Text>
        {hint ? <Text style={styles.toggleHint}>{hint}</Text> : null}
      </View>
      <Switch value={value} onValueChange={onValueChange} accessibilityLabel={label} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#05070A' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 16 },
  back: { fontFamily: Fonts.sans, color: '#E8C872', fontWeight: '600' },
  title: { flex: 1, textAlign: 'center', fontFamily: Fonts.serif, color: '#F5F0FF', fontSize: 18 },
  spacer: { width: 48 },
  content: { padding: 16, gap: 16, paddingBottom: 48 },
  lead: {
    fontFamily: Fonts.sans,
    fontSize: 13.5,
    lineHeight: 20,
    color: 'rgba(235,228,248,0.72)',
  },
  panel: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(232,200,114,0.22)',
    backgroundColor: 'rgba(12,16,28,0.72)',
    padding: 12,
    gap: 4,
  },
  section: { gap: 10 },
  sectionTitle: {
    fontFamily: Fonts.sans,
    fontSize: 11,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: 'rgba(235,228,248,0.55)',
  },
  empty: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    color: 'rgba(235,228,248,0.55)',
  },
  selectedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minHeight: 48,
    paddingVertical: 6,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(235,228,248,0.12)',
  },
  selectedMeta: { flex: 1, gap: 2 },
  selectedLabel: { fontFamily: Fonts.sans, color: '#F5F0FF', fontSize: 14, fontWeight: '600' },
  beaconHint: { fontFamily: Fonts.sans, fontSize: 11, color: 'rgba(235,228,248,0.5)' },
  removeButton: { paddingHorizontal: 8, paddingVertical: 6, minHeight: 44, justifyContent: 'center' },
  removeText: { fontFamily: Fonts.sans, fontSize: 12, color: '#E8C872' },
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
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'space-between',
  },
  customBlock: { gap: 10, marginTop: 8 },
  customHint: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    lineHeight: 17,
    color: 'rgba(235,228,248,0.55)',
  },
  error: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    color: '#F4A4A4',
  },
  addButton: {
    alignSelf: 'flex-start',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(232,200,114,0.45)',
    paddingHorizontal: 14,
    paddingVertical: 10,
    minHeight: 44,
    justifyContent: 'center',
  },
  addButtonText: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    fontWeight: '600',
    color: '#E8C872',
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 48,
    gap: 12,
  },
  toggleCopy: { flex: 1, gap: 2 },
  toggleLabel: { fontFamily: Fonts.sans, color: '#F5F0FF', fontSize: 14 },
  toggleHint: { fontFamily: Fonts.sans, fontSize: 11, color: 'rgba(235,228,248,0.5)' },
});
