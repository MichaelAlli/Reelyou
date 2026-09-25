import { useRouter } from 'expo-router';
import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { EmotionAiCopy } from '@/constants/emotionAiCopy';
import { Fonts, Spacing } from '@/constants/theme';
import { useTodayFocusRecommendations } from '@/todayFocus/recommendations/TodayFocusRecommendationsProvider';

function TodayFocusResourcesSectionComponent() {
  const router = useRouter();
  const { guideResponse, markRecommendationOpened } = useTodayFocusRecommendations();

  if (!guideResponse || guideResponse.recommendations.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyTitle}>Resources for today&apos;s focus</Text>
        <Text style={styles.emptyBody}>
          {guideResponse?.emptyState ?? EmotionAiCopy.focusEmptyPeace}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.wrap}>
      <Text style={styles.section}>Resources for today&apos;s focus</Text>
      <Text style={styles.guide}>{guideResponse.messageFromGuide}</Text>
      <Text style={styles.note}>{guideResponse.transparencyNote}</Text>
      {guideResponse.recommendations.map((item) => (
        <Pressable
          key={item.id}
          style={styles.card}
          accessibilityRole="button"
          onPress={() => {
            markRecommendationOpened(item.id);
            if (item.destination.startsWith('http')) return;
            router.push(item.destination as never);
          }}>
          <Text style={styles.cardTitle}>{item.title}</Text>
          <Text style={styles.cardSummary} numberOfLines={2}>
            {item.summary}
          </Text>
          <Text style={styles.cardWhy}>{item.whyRelevant}</Text>
          {!item.destination.startsWith('http') ? (
            <Text style={styles.cardAction}>{item.actionLabel} ›</Text>
          ) : (
            <Text style={styles.cardAction}>{item.actionLabel} (external)</Text>
          )}
        </Pressable>
      ))}
    </View>
  );
}

export const TodayFocusResourcesSection = memo(TodayFocusResourcesSectionComponent);

const styles = StyleSheet.create({
  wrap: { marginTop: Spacing.lg, gap: 10 },
  section: {
    fontFamily: Fonts.sans,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.6,
    color: '#E8C872',
  },
  guide: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    lineHeight: 19,
    color: 'rgba(248, 244, 236, 0.82)',
  },
  note: {
    fontFamily: Fonts.sans,
    fontSize: 11,
    lineHeight: 16,
    color: 'rgba(248, 244, 236, 0.58)',
    marginBottom: 4,
  },
  card: {
    borderRadius: 14,
    padding: 14,
    backgroundColor: 'rgba(10, 14, 34, 0.82)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(196, 168, 255, 0.28)',
    gap: 6,
  },
  cardTitle: {
    fontFamily: Fonts.serif,
    fontSize: 16,
    color: '#FFF8F0',
  },
  cardSummary: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    lineHeight: 18,
    color: 'rgba(248, 244, 236, 0.78)',
  },
  cardWhy: {
    fontFamily: Fonts.sans,
    fontSize: 11,
    lineHeight: 16,
    color: 'rgba(196, 168, 255, 0.85)',
  },
  cardAction: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    fontWeight: '600',
    color: '#E8C872',
    marginTop: 4,
  },
  empty: { marginTop: Spacing.lg, gap: 8 },
  emptyTitle: {
    fontFamily: Fonts.sans,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.6,
    color: '#E8C872',
  },
  emptyBody: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    lineHeight: 19,
    color: 'rgba(248, 244, 236, 0.68)',
  },
});
