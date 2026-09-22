import { useRouter } from 'expo-router';
import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { MySkyRenderer } from '@/components/my-sky/MySkyRenderer';
import {
  OWNER_PROFILE_CARD_RADIUS,
  OWNER_PROFILE_HORIZONTAL_INSET,
  OWNER_PROFILE_PANEL_BORDER,
  OWNER_PROFILE_SECTION_GAP,
} from '@/components/profile/owner/ownerProfileLayout';
import { Fonts } from '@/constants/theme';
import type { MySkyView } from '@/mySky/types';

interface OwnerProfileMySkyPreviewCardProps {
  view: MySkyView;
  /** Visitor handoff — defaults to owner My Sky tab. */
  viewFullSkyHref?: string;
}

function OwnerProfileMySkyPreviewCardComponent({
  view,
  viewFullSkyHref,
}: OwnerProfileMySkyPreviewCardProps) {
  const router = useRouter();

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>My Sky</Text>
          <Text style={styles.info}>ⓘ</Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="View full My Sky"
          onPress={() =>
            router.push((viewFullSkyHref ?? '/(tabs)/sky') as never)
          }>
          <Text style={styles.link}>View Full Sky →</Text>
        </Pressable>
      </View>
      <View style={styles.preview} pointerEvents="none">
        <View style={styles.previewScale}>
          <MySkyRenderer view={view} mode="resting" />
        </View>
      </View>
    </View>
  );
}

export const OwnerProfileMySkyPreviewCard = memo(OwnerProfileMySkyPreviewCardComponent);

const styles = StyleSheet.create({
  card: {
    marginHorizontal: OWNER_PROFILE_HORIZONTAL_INSET,
    marginTop: OWNER_PROFILE_SECTION_GAP,
    borderRadius: OWNER_PROFILE_CARD_RADIUS,
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 8,
    backgroundColor: 'rgba(10, 14, 34, 0.82)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: OWNER_PROFILE_PANEL_BORDER,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
    paddingHorizontal: 0,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  title: {
    fontFamily: Fonts.serif,
    fontSize: 20,
    color: '#FFF8F0',
  },
  info: {
    fontSize: 12,
    color: 'rgba(196, 168, 255, 0.85)',
  },
  link: {
    fontFamily: Fonts.sans,
    fontSize: 11,
    fontWeight: '600',
    color: '#E8C872',
  },
  preview: {
    height: 232,
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: 'rgba(4, 6, 16, 0.55)',
  },
  previewScale: {
    flex: 1,
    transform: [{ scale: 1.12 }, { translateY: -6 }],
  },
});
