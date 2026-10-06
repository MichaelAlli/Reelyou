/** PROFILE / ME — OWNER VIEW — self-study hub; public visitor view uses separate routes later. */
import { ImageBackground } from 'expo-image';
import { useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { useReelyouConnect } from '@/connect/ReelyouConnectProvider';
import { OwnerProfileHero } from '@/components/profile/owner/OwnerProfileHero';
import { OwnerProfileRelationshipCountsRow } from '@/components/profile/owner/OwnerProfileRelationshipCountsRow';
import { useReelyouAuth } from '@/auth/ReelyouAuthProvider';
import { resolveActiveUserId } from '@/auth/resolveActiveUserId';
import { isReelyouAuthConfigured } from '@/auth/reellyouAuthConfig';
import { isExplicitDevDemoModeEnabled } from '@/auth/demoMode';
import { currentUser } from '@/data/mockData';
import { buildProfileRelationshipCounts } from '@/social/skyFollow/profileRelationshipCounts';
import { OwnerProfileMetricsStrip } from '@/components/profile/owner/OwnerProfileMetricsStrip';
import { OwnerProfileMySkyPreviewCard } from '@/components/profile/owner/OwnerProfileMySkyPreviewCard';
import { OwnerProfileSkywritingsCard } from '@/components/profile/owner/OwnerProfileSkywritingsCard';
import { OwnerProfileOptionsSheet } from '@/components/profile/owner/OwnerProfileOptionsSheet';
import { ProfileSkyHeaderStyleSheet } from '@/components/profile/owner/ProfileSkyHeaderStyleSheet';
import { OwnerProfileTopChrome } from '@/components/profile/owner/OwnerProfileTopChrome';
import { RippleMetricDetailSheet } from '@/components/legacy/ripple/RippleMetricDetailSheet';
import {
  buildRippleMetricDetailView,
  type RippleMetricDetailKind,
} from '@/legacy/buildRippleMetricDetails';
import { useLegacyRippleViewModel } from '@/legacy/useLegacyRippleViewModel';
import { OwnerProfilePhotoSheet } from '@/components/profile/owner/OwnerProfilePhotoSheet';
import { useUserAvatar } from '@/identity/UserAvatarProvider';
import { useProfilePhotoEditor } from '@/identity/useProfilePhotoEditor';
import { deriveLivesImpacted } from '@/humanPotential/humanPotentialMetricsEngine';
import { deriveContributionsMade } from '@/legacy/buildLegacyRippleViewModel';
import { buildOwnerProfileView } from '@/profile/buildOwnerProfileView';
import { profileOwnerCelestialBackground } from '@/profile/profileOwnerAssets';
import { useOnboarding } from '@/onboarding';
import { shareOwnerProfile } from '@/profile/shareOwnerProfile';
import {
  buildVisitorProfileHref,
  buildVisitorSelfPreviewHref,
  VISITOR_PROFILE_QA_OWNER_ID,
} from '@/profile/visitorProfileRoute';
import { legacyRippleEnabled } from '@/constants/betaFeatures';
import { Fonts } from '@/constants/theme';

export function OwnerProfileScreen() {
  const router = useRouter();
  const { user: authUser } = useReelyouAuth();
  const activeUserId = resolveActiveUserId(authUser);
  const ownerId =
    activeUserId ?? (isExplicitDevDemoModeEnabled() ? currentUser.id : '');
  const { skywrites, mySkyView, profileSkyAreaShortcutIds, northStar } = useOnboarding();
  const { skyFollowGraph } = useReelyouConnect();
  const relationshipCounts = useMemo(
    () =>
      buildProfileRelationshipCounts({
        graph: skyFollowGraph,
        profileOwnerId: ownerId,
        viewerId: ownerId,
        isOwnProfile: true,
      }),
    [ownerId, skyFollowGraph],
  );
  const userAvatar = useUserAvatar();
  const photoEditor = useProfilePhotoEditor();

  const { model: rippleModel, metrics, contributions, userDirectory, blockedUserIds } =
    useLegacyRippleViewModel();
  const ownerIdForMetrics = ownerId;

  const ownerView = useMemo(() => {
    const displayName =
      authUser?.fullName?.trim() ||
      (isReelyouAuthConfigured() ? 'Your profile' : 'You');
    const northStarBio = northStar.originalVision.trim();
    return buildOwnerProfileView({
      owner: {
        id: ownerId,
        name: displayName,
        bio: northStarBio || undefined,
      },
      skywrites,
      profileSkyAreaShortcutIds,
      avatarUriOverride: userAvatar.profilePhotoDisplayUri,
      metrics: {
        livesImpacted: deriveLivesImpacted(ownerIdForMetrics, metrics),
        contributionsMade: deriveContributionsMade(ownerIdForMetrics, contributions),
      },
    });
  }, [
    authUser?.fullName,
    northStar.originalVision,
    ownerId,
    profileSkyAreaShortcutIds,
    contributions,
    metrics,
    ownerIdForMetrics,
    skywrites,
    userAvatar.profilePhotoDisplayUri,
  ]);
  const [metricKind, setMetricKind] = useState<RippleMetricDetailKind | null>(null);
  const [optionsOpen, setOptionsOpen] = useState(false);
  const [headerStyleOpen, setHeaderStyleOpen] = useState(false);
  const [shareAck, setShareAck] = useState<string | null>(null);

  const metricDetailView = useMemo(() => {
    if (!metricKind) return null;
    return buildRippleMetricDetailView({
      kind: metricKind,
      ownerUserId: ownerId,
      metrics,
      contributions,
      userDirectory,
      blockedUserIds,
      mode: 'owner',
    });
  }, [blockedUserIds, contributions, metricKind, metrics, ownerId, userDirectory]);

  const handleBack = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace('/(tabs)/home' as never);
  }, [router]);

  const handleLegacy = useCallback(() => {
    if (!legacyRippleEnabled()) return;
    router.push('/legacy' as never);
  }, [router]);

  const openOptions = useCallback(() => setOptionsOpen(true), []);
  const closeOptions = useCallback(() => setOptionsOpen(false), []);

  const handleShareProfile = useCallback(async () => {
    const result = await shareOwnerProfile({
      displayName: ownerView.identity.name,
      ownerId: ownerView.identity.id,
    });
    if (result === 'copied') {
      setShareAck('Profile link copied ✨');
      setTimeout(() => setShareAck(null), 2400);
    }
  }, [ownerView.identity.id, ownerView.identity.name]);

  if (!ownerId) {
    return <View style={styles.root} />;
  }

  return (
    <View style={styles.root}>
      <OwnerProfilePhotoSheet
        visible={photoEditor.sheetOpen}
        displayName={ownerView.identity.name}
        hasPhoto={photoEditor.hasPhoto}
        previewUri={photoEditor.previewUri}
        imageSize={photoEditor.imageSize}
        cropTransform={photoEditor.cropTransform}
        feedback={photoEditor.feedback}
        saving={photoEditor.saving}
        onClose={photoEditor.closeEditor}
        onChooseLibrary={photoEditor.chooseLibrary}
        onTakePhoto={photoEditor.takePhoto}
        onSavePreview={() => void photoEditor.savePreview()}
        onDiscardPreview={photoEditor.discardPreview}
        onRemovePhoto={photoEditor.removePhoto}
        onImageSize={photoEditor.setImageSize}
        onCropTransformChange={photoEditor.setCropTransform}
        onResetCrop={photoEditor.resetCrop}
      />
      <ProfileSkyHeaderStyleSheet
        visible={headerStyleOpen}
        displayName={ownerView.identity.name}
        onClose={() => setHeaderStyleOpen(false)}
      />
      <OwnerProfileOptionsSheet
        visible={optionsOpen}
        onClose={closeOptions}
        onCustomizeSkyHeader={() => setHeaderStyleOpen(true)}
        onShareProfile={handleShareProfile}
        onPreviewProfile={() =>
          router.push(buildVisitorSelfPreviewHref(ownerId, { previewAs: 'public' }) as never)
        }
        onPreviewProfileConnectedSky={() =>
          router.push(buildVisitorSelfPreviewHref(ownerId, { previewAs: 'connected' }) as never)
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
        <OwnerProfileTopChrome
          onBack={handleBack}
          onShare={handleShareProfile}
          onOverflow={openOptions}
        />
        {shareAck ? (
          <View style={styles.shareAck} pointerEvents="none">
            <Text style={styles.shareAckText}>{shareAck}</Text>
          </View>
        ) : null}
        <OwnerProfileHero
          identity={ownerView.identity}
          avatarImageKey={userAvatar.profilePhotoRevision}
          onChangePhotoPress={photoEditor.openEditor}
        />
        <OwnerProfileMetricsStrip
          metrics={ownerView.metrics}
          onLegacyPress={handleLegacy}
          legacyPressEnabled={legacyRippleEnabled()}
          onLivesImpactedPress={() => setMetricKind('lives')}
          onContributionsPress={() => setMetricKind('contributions')}
        />
        <RippleMetricDetailSheet
          visible={metricKind != null}
          view={metricDetailView}
          onClose={() => setMetricKind(null)}
        />
        <OwnerProfileRelationshipCountsRow
          counts={relationshipCounts}
          onPressFollowedSkies={() => router.push('/sky-friends?tab=following' as never)}
          onPressSkyFollowing={() => router.push('/sky-friends?tab=followers' as never)}
        />
        <OwnerProfileMySkyPreviewCard view={mySkyView} />
        <OwnerProfileSkywritingsCard
          section={ownerView.skywritings}
          profileSkyAreaShortcutIds={profileSkyAreaShortcutIds}
        />
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
  shareAck: {
    alignSelf: 'center',
    marginTop: 4,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(8, 12, 28, 0.88)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(232, 200, 114, 0.35)',
  },
  shareAckText: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    fontWeight: '600',
    color: '#F5E6B8',
  },
});
