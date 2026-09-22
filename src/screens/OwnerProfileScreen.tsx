/** PROFILE / ME — OWNER VIEW — self-study hub; public visitor view uses separate routes later. */
import { ImageBackground } from 'expo-image';
import { useRouter } from 'expo-router';
import { useCallback, useMemo } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { OwnerProfileHero } from '@/components/profile/owner/OwnerProfileHero';
import { OwnerProfileMetricsStrip } from '@/components/profile/owner/OwnerProfileMetricsStrip';
import { OwnerProfileMySkyPreviewCard } from '@/components/profile/owner/OwnerProfileMySkyPreviewCard';
import { OwnerProfileSkywritingsCard } from '@/components/profile/owner/OwnerProfileSkywritingsCard';
import { OwnerProfileTopChrome } from '@/components/profile/owner/OwnerProfileTopChrome';
import { buildOwnerProfileView } from '@/profile/buildOwnerProfileView';
import { profileOwnerCelestialBackground } from '@/profile/profileOwnerAssets';
import { useOnboarding } from '@/onboarding';

export function OwnerProfileScreen() {
  const router = useRouter();
  const { skywrites, mySkyView } = useOnboarding();

  const ownerView = useMemo(() => buildOwnerProfileView({ skywrites }), [skywrites]);

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

  return (
    <View style={styles.root}>
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
        <OwnerProfileTopChrome onBack={handleBack} />
        <OwnerProfileHero identity={ownerView.identity} />
        <OwnerProfileMetricsStrip metrics={ownerView.metrics} onLegacyPress={handleLegacy} />
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
