import { LinearGradient } from 'expo-linear-gradient';
import { memo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import {
  HomeGrowingInPillIcon,
  type GrowingInPillIconType,
} from '@/components/home/HomeGrowingInPillIcon';
import {
  OWNER_PROFILE_CARD_RADIUS,
  OWNER_PROFILE_HORIZONTAL_INSET,
  OWNER_PROFILE_PANEL_BORDER,
  OWNER_PROFILE_SECTION_GAP,
} from '@/components/profile/owner/ownerProfileLayout';
import { Fonts } from '@/constants/theme';
import type { OwnerProfileSkywritingPreview } from '@/profile/ownerProfileTypes';

const PILL_THEMES: Record<
  OwnerProfileSkywritingPreview['tone'],
  {
    icon: GrowingInPillIconType;
    iconColor: string;
    gradient: [string, string, string];
    border: string;
  }
> = {
  briefcase: {
    icon: 'briefcase',
    iconColor: '#C4B5FD',
    gradient: ['rgba(62, 42, 108, 0.92)', 'rgba(48, 32, 88, 0.88)', 'rgba(36, 24, 68, 0.94)'],
    border: 'rgba(167, 139, 250, 0.38)',
  },
  leaf: {
    icon: 'leaf',
    iconColor: '#F5E6B8',
    gradient: ['rgba(108, 78, 38, 0.9)', 'rgba(88, 62, 28, 0.88)', 'rgba(68, 48, 22, 0.92)'],
    border: 'rgba(232, 200, 114, 0.36)',
  },
  creative: {
    icon: 'creative',
    iconColor: '#7EECD8',
    gradient: ['rgba(28, 72, 62, 0.92)', 'rgba(22, 58, 50, 0.9)', 'rgba(16, 44, 38, 0.94)'],
    border: 'rgba(94, 234, 212, 0.32)',
  },
  community: {
    icon: 'community',
    iconColor: '#D8C4FF',
    gradient: ['rgba(68, 44, 102, 0.92)', 'rgba(52, 34, 82, 0.9)', 'rgba(40, 26, 64, 0.94)'],
    border: 'rgba(196, 168, 255, 0.34)',
  },
};

interface OwnerProfileSkywritingsCardProps {
  previews: OwnerProfileSkywritingPreview[];
}

function OwnerProfileSkywritingsCardComponent({ previews }: OwnerProfileSkywritingsCardProps) {
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
        contentContainerStyle={styles.pillRow}>
        {previews.map((preview) => {
          const theme = PILL_THEMES[preview.tone];
          return (
            <LinearGradient
              key={preview.id}
              colors={theme.gradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[styles.pill, { borderColor: theme.border }]}>
              <HomeGrowingInPillIcon type={theme.icon} color={theme.iconColor} size={14} />
              <Text style={styles.pillLabel} numberOfLines={1}>
                {preview.label}
              </Text>
            </LinearGradient>
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
    paddingBottom: 10,
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
  pillRow: {
    gap: 7,
    paddingRight: 2,
    paddingBottom: 0,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    maxWidth: 168,
  },
  pillLabel: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    fontWeight: '600',
    color: '#FFF8F0',
    flexShrink: 1,
  },
});
