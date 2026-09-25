/** PROFILE / ME — OWNER VIEW — self-study hub; public visitor view uses separate routes later. */
import { ImageBackground } from 'expo-image';
import { useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { useReelyouConnect } from '@/connect/ReelyouConnectProvider';
import { OwnerProfileHero } from '@/components/profile/owner/OwnerProfileHero';
import { OwnerProfileSkyFriendsEntry } from '@/components/profile/owner/OwnerProfileSkyFriendsEntry';
import { OwnerProfileMetricsStrip } from '@/components/profile/owner/OwnerProfileMetricsStrip';
import { OwnerProfileMySkyPreviewCard } from '@/components/profile/owner/OwnerProfileMySkyPreviewCard';
import { OwnerProfileSkywritingsCard } from '@/components/profile/owner/OwnerProfileSkywritingsCard';
import { OwnerProfileOptionsSheet } from '@/components/profile/owner/OwnerProfileOptionsSheet';
import { OwnerProfileTopChrome } from '@/components/profile/owner/OwnerProfileTopChrome';
import { RippleMetricDetailSheet } from '@/components/legacy/ripple/RippleMetricDetailSheet';
import {
  buildRippleMetricDetailView,
  type RippleMetricDetailKind,
} from '@/legacy/buildRippleMetricDetails';
import { useLegacyRippleViewModel } from '@/legacy/useLegacyRippleViewModel';
import { buildOwnerProfileView } from '@/profile/buildOwnerProfileView';
import { profileOwnerCelestialBackground } from '@/profile/profileOwnerAssets';
import { useOnboarding } from '@/onboarding';
import {
  buildVisitorProfileHref,
  buildVisitorSelfPreviewHref,
  VISITOR_PROFILE_QA_OWNER_ID,
} from '@/profile/visitorProfileRoute';

export function OwnerProfileScreen() {
  const router = useRouter();
  const { skywrites, mySkyView } = useOnboarding();
  const { skyFriendsCount } = useReelyouConnect();

  const ownerView = useMemo(() => buildOwnerProfileView({ skywrites }), [skywrites]);
  const { ownerUserId, metrics, contributions, userDirectory, blockedUserIds } =
    useLegacyRippleViewModel();
  const [metricKind, setMetricKind] = useState<RippleMetricDetailKind | null>(null);
  const [optionsOpen, setOptionsOpen] = useState(false);

  const metricDetailView = useMemo(() => {
    if (!metricKind) return null;
    return buildRippleMetricDetailView({
      kind: metricKind,
      ownerUserId,
      metrics,
      contributions,
      userDirectory,
      blockedUserIds,
      mode: 'owner',
    });
  }, [blockedUserIds, contributions, metricKind, metrics, ownerUserId, userDirectory]);

  const handleBack = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace('/(tabs)/home' as never);
  }, [router]);

  const handleLegacy = useCallback(() => {
    router.push('/legacy' as never);
  }, [router]);

  const openOptions = useCallback(() => setOptionsOpen(true), []);
  const closeOptions = useCallback(() => setOptionsOpen(false), []);

  return (
    <View style={styles.root}>
      <OwnerProfileOptionsSheet
        visible={optionsOpen}
        onClose={closeOptions}
        onPreviewProfile={() =>
          router.push(buildVisitorSelfPreviewHref(undefined, { previewAs: 'public' }) as never)
        }
        onPreviewProfileConnectedSky={() =>
          router.push(buildVisitorSelfPreviewHref(undefined, { previewAs: 'connected' }) as never)
        }
        onPreviewDemoVisitor={() =>
          router.push(buildVisitorProfileHref(VISITOR_PROFILE_QA_OWNER_ID) as never)
        }
      />
      <ImageBackground
        source={profileOwnerCelestialBackground}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
        contentPosition="top"
      />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <OwnerProfileTopChrome onBack={handleBack} onOverflow={openOptions} />
        <OwnerProfileHero identity={ownerView.identity} />
        <OwnerProfileMetricsStrip
          metrics={ownerView.metrics}
          onLegacyPress={handleLegacy}
          onLivesImpactedPress={() => setMetricKind('lives')}
          onContributionsPress={() => setMetricKind('contributions')}
        />
        <RippleMetricDetailSheet
          visible={metricKind != null}
          view={metricDetailView}
          onClose={() => setMetricKind(null)}
        />
        <OwnerProfileSkyFriendsEntry
          count={skyFriendsCount}
          onPress={() => router.push('/sky-friends' as never)}
        />
        <OwnerProfileMySkyPreviewCard view={mySkyView} />
        <OwnerProfileSkywritingsCard section={ownerView.skywritings} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#05070A',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 2,
  },
});
