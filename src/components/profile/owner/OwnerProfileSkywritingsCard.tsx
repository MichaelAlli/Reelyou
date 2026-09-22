import { memo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import {
  OWNER_PROFILE_CARD_RADIUS,
  OWNER_PROFILE_HORIZONTAL_INSET,
  OWNER_PROFILE_PANEL_BORDER,
  OWNER_PROFILE_SECTION_GAP,
} from '@/components/profile/owner/ownerProfileLayout';
import { Fonts } from '@/constants/theme';
import type { ProfileSkywritingsSection } from '@/profile/buildProfileSkywritingsSection';
import { SKY_AREA_TAB_ALL, type SkyAreaTabId } from '@/skyAreas/skyAreaCategory';

interface OwnerProfileSkywritingsCardProps {
  section: ProfileSkywritingsSection;
}

function OwnerProfileSkywritingsCardComponent({ section }: OwnerProfileSkywritingsCardProps) {
  const [selectedTabId, setSelectedTabId] = useState<SkyAreaTabId>(SKY_AREA_TAB_ALL);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.titleBlock}>
          <Text style={styles.title}>Skywritings</Text>
          <Text style={styles.subtitle}>Reflections, questions, and threads you’ve shared.</Text>
        </View>
        <Text style={styles.chevron}>⌄</Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabRow}>
        {section.tabs.map((tab) => {
          const active = tab.id === selectedTabId;
          return (
            <Pressable
              key={tab.id}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              onPress={() => setSelectedTabId(tab.id)}
              style={[styles.tab, active && styles.tabActive]}>
              <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>{tab.label}</Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

export const OwnerProfileSkywritingsCard = memo(OwnerProfileSkywritingsCardComponent);

const styles = StyleSheet.create({
  card: {
    marginHorizontal: OWNER_PROFILE_HORIZONTAL_INSET,
    marginTop: OWNER_PROFILE_SECTION_GAP,
    marginBottom: 4,
    borderRadius: OWNER_PROFILE_CARD_RADIUS,
    paddingHorizontal: 14,
    paddingTop: 11,
    paddingBottom: 8,
    backgroundColor: 'rgba(10, 14, 34, 0.82)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: OWNER_PROFILE_PANEL_BORDER,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 8,
  },
  titleBlock: {
    flex: 1,
    gap: 3,
  },
  title: {
    fontFamily: Fonts.serif,
    fontSize: 18,
    color: '#FFF8F0',
  },
  subtitle: {
    fontFamily: Fonts.sans,
    fontSize: 11,
    lineHeight: 15,
    color: 'rgba(248, 244, 236, 0.72)',
  },
  chevron: {
    fontSize: 18,
    color: 'rgba(248, 244, 236, 0.55)',
    marginTop: 2,
  },
  tabRow: {
    gap: 7,
    paddingBottom: 0,
    paddingRight: 2,
  },
  tab: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(167, 139, 250, 0.22)',
    backgroundColor: 'rgba(8, 12, 28, 0.55)',
  },
  tabActive: {
    borderColor: 'rgba(232, 200, 114, 0.48)',
    backgroundColor: 'rgba(232, 200, 114, 0.16)',
    shadowColor: '#E8C872',
    shadowOpacity: 0.25,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 0 },
  },
  tabLabel: {
    fontFamily: Fonts.sans,
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(248, 244, 236, 0.68)',
  },
  tabLabelActive: {
    color: '#FFF8F0',
  },
});
