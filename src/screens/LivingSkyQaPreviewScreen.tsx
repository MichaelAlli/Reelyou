import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SkywriteOwnerSkySnapshotPanel } from '@/components/skywrite/SkywriteOwnerSkySnapshotPanel';
import { MySkywritesCopy } from '@/constants/mySkywritesCopy';
import { Fonts, Spacing } from '@/constants/theme';
import { EXPLORE_DEMO_PROFILES } from '@/explore/exploreDemoSkies';
import { applyLivingSkyFeaturedToggle } from '@/mySky/livingPreview/livingSkyFeaturedLogic';
import {
  LIVING_SKY_QA_MANUAL_IDS,
  LIVING_SKY_QA_OWNER_ID,
  livingSkyQaPosts,
  parseLivingSkyQaFixture,
} from '@/mySky/livingPreview/livingSkyQaFixtures';

/**
 * Synthetic Sky snapshot QA. Reads existing demo Skywrites only.
 * Featured choices on this screen stay in memory and are not saved.
 */
export function LivingSkyQaPreviewScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ fixture?: string }>();
  const fixture = parseLivingSkyQaFixture(params.fixture);
  const posts = useMemo(() => livingSkyQaPosts(fixture), [fixture]);
  const visitor = fixture === 'visitor';
  const [manualIds, setManualIds] = useState<string[] | null>(
    fixture === 'manual' ? [...LIVING_SKY_QA_MANUAL_IDS] : null,
  );
  const [note, setNote] = useState<string | null>(null);
  const profile = EXPLORE_DEMO_PROFILES[LIVING_SKY_QA_OWNER_ID];

  useEffect(() => {
    setManualIds(fixture === 'manual' ? [...LIVING_SKY_QA_MANUAL_IDS] : null);
    setNote(null);
  }, [fixture]);

  const featurePost = (postId: string) => {
    const result = applyLivingSkyFeaturedToggle(manualIds ?? [], postId);
    if (result.reason === 'limit') {
      setNote(MySkywritesCopy.livingSkyFeatureLimit);
      return;
    }
    setNote(null);
    setManualIds(result.ids.length > 0 ? result.ids : null);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back to QA Gallery"
          onPress={() => router.push('/qa/screens?qaPreview=1' as never)}
          style={styles.back}>
          <Text style={styles.backText}>QA Gallery</Text>
        </Pressable>
        <Text style={styles.title}>Living Sky preview</Text>
        <Text testID="living-sky-qa-status" style={styles.status}>
          {visitor ? 'Visitor snapshot' : 'My Sky snapshot'} · {fixture} ·{' '}
          {manualIds && manualIds.length > 0 ? `manual ${manualIds.length}` : 'automatic'} · not
          synced
        </Text>
        <Text style={styles.note}>
          {visitor
            ? 'Visitor view. Private and Sky Friends moments stay hidden. The visitor cannot change highlights.'
            : 'Synthetic preview. Sky Highlights on this screen are not saved to an account.'}
        </Text>
        <SkywriteOwnerSkySnapshotPanel
          ownerId={LIVING_SKY_QA_OWNER_ID}
          displayName={profile.name}
          connectionStatus="none"
          kind="demo"
          ownerSkywrites={posts}
          joinedCommunityIds={[]}
          guidanceActive={false}
          featuredIdsOverride={visitor ? null : manualIds}
        />
        {fixture === 'manual' ? (
          <View style={styles.controls}>
            <Text style={styles.note}>
              {MySkywritesCopy.skyHighlightsTitle}. {MySkywritesCopy.skyHighlightsSupport}{' '}
              {MySkywritesCopy.highlightsSelectedCount(manualIds?.length ?? 0)}
            </Text>
            {posts.map((post) => {
              const featured = manualIds?.includes(post.id) ?? false;
              return (
                <Pressable
                  key={post.id}
                  accessibilityRole="button"
                  accessibilityLabel={
                    featured ? MySkywritesCopy.unfeatureInMySky : MySkywritesCopy.featureInMySky
                  }
                  onPress={() => featurePost(post.id)}
                  style={styles.control}>
                  <Text style={styles.controlText}>
                    {featured ? 'Remove feature' : 'Feature in My Sky'} · {post.mediaMode}
                  </Text>
                </Pressable>
              );
            })}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={MySkywritesCopy.useAutomaticSkyMoments}
              onPress={() => {
                setManualIds(null);
                setNote(null);
              }}
              style={styles.control}>
              <Text style={styles.controlText}>{MySkywritesCopy.useAutomaticSkyMoments}</Text>
            </Pressable>
            {note ? <Text style={styles.note}>{note}</Text> : null}
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#05070A' },
  content: { paddingBottom: Spacing.xl, alignItems: 'center' },
  back: { alignSelf: 'flex-start', marginLeft: Spacing.md, marginTop: Spacing.sm, minHeight: 44, justifyContent: 'center' },
  backText: { fontFamily: Fonts.sans, fontSize: 13, color: '#E8C872' },
  title: { fontFamily: Fonts.serif, fontSize: 22, color: '#FFF8F0', marginTop: 4 },
  status: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    color: 'rgba(248,244,236,0.72)',
    textAlign: 'center',
    marginTop: 6,
    paddingHorizontal: Spacing.md,
  },
  note: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    lineHeight: 17,
    color: 'rgba(248,244,236,0.55)',
    textAlign: 'center',
    marginTop: 6,
    paddingHorizontal: Spacing.lg,
  },
  controls: { width: '100%', paddingHorizontal: Spacing.md, gap: 8, marginTop: 8 },
  control: {
    minHeight: 44,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(232, 200, 114, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  controlText: { fontFamily: Fonts.sans, fontSize: 13, color: '#FFF8F0', textAlign: 'center' },
});
