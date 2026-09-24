import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  BackHandler,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { BottomNav } from '@/components/BottomNav';
import { LegacySegmentToggle } from '@/components/legacy/LegacySegmentToggle';
import { GlowButton } from '@/components/GlowButton';
import { LegacyMomentCard } from '@/components/legacy/LegacyMomentCard';
import { LegacyCopy } from '@/constants/legacyCopy';
import { Fonts, Spacing, TabBarHeight } from '@/constants/theme';
import { useLegacy } from '@/legacy/LegacyProvider';
import { useThemedStyles } from '@/theme/useTheme';

const PROFILE_ME_ROUTE = '/(tabs)/profile' as const;

export function LegacyExperienceScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const navContentInset = TabBarHeight + Math.max(insets.bottom, Spacing.sm);
  const {
    moments,
    hiddenMoments,
    reelSequence,
    hideMoment,
    restoreMoment,
    editMomentCopy,
  } = useLegacy();
  const [showHidden, setShowHidden] = useState(false);

  const styles = useThemedStyles((tokens) =>
    StyleSheet.create({
      root: { flex: 1 },
      safe: { flex: 1 },
      scroll: { paddingHorizontal: Spacing.lg },
      back: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        alignSelf: 'flex-start',
        minHeight: 44,
        paddingRight: 12,
        paddingLeft: 4,
        marginTop: Spacing.sm,
        borderRadius: 999,
        backgroundColor: 'rgba(0, 0, 0, 0.18)',
      },
      backText: { fontFamily: Fonts.sans, fontSize: 14, fontWeight: '600', color: tokens.gold },
      title: {
        fontFamily: Fonts.serif,
        fontSize: 32,
        fontWeight: '600',
        color: tokens.primaryText,
        marginBottom: 8,
      },
      hero: { fontFamily: Fonts.sans, fontSize: 15, lineHeight: 22, color: tokens.secondaryText, marginBottom: 6 },
      sub: { fontFamily: Fonts.sans, fontSize: 13, lineHeight: 19, color: tokens.mutedText, marginBottom: Spacing.lg },
      reelCard: {
        marginBottom: Spacing.lg,
        padding: Spacing.md,
        borderRadius: 16,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: 'rgba(212, 175, 55, 0.35)',
        backgroundColor: 'rgba(212, 175, 55, 0.08)',
      },
      reelSub: { fontFamily: Fonts.sans, fontSize: 12, color: tokens.mutedText, marginTop: 8, textAlign: 'center' },
      emptyTitle: { fontFamily: Fonts.serif, fontSize: 20, color: tokens.primaryText, marginBottom: 8 },
      emptyBody: { fontFamily: Fonts.sans, fontSize: 14, lineHeight: 20, color: tokens.secondaryText },
      section: { fontFamily: Fonts.sans, fontSize: 12, fontWeight: '600', color: tokens.gold, marginBottom: Spacing.sm },
      toggleHidden: { marginTop: Spacing.md, marginBottom: Spacing.sm },
      toggleText: { fontFamily: Fonts.sans, fontSize: 13, fontWeight: '600', color: tokens.gold },
    }),
  );

  const openRipples = useCallback(() => {
    router.push('/legacy/ripple' as never);
  }, [router]);

  const handleBack = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace(PROFILE_ME_ROUTE as never);
  }, [router]);

  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      handleBack();
      return true;
    });
    return () => subscription.remove();
  }, [handleBack]);

  const handlePlayReel = useCallback(() => {
    if (reelSequence.momentIds.length === 0) {
      Alert.alert(LegacyCopy.reelEmpty);
      return;
    }
    router.push('/legacy/reel-you' as never);
  }, [reelSequence.momentIds.length, router]);

  const confirmHide = useCallback(
    (legacyMomentId: string) => {
      Alert.alert(LegacyCopy.hide, 'This moment will be hidden from your Legacy timeline.', [
        { text: 'Cancel', style: 'cancel' },
        { text: LegacyCopy.hide, onPress: () => hideMoment(legacyMomentId) },
      ]);
    },
    [hideMoment],
  );

  const promptEdit = useCallback(
    (legacyMomentId: string, currentTitle: string) => {
      Alert.prompt(
        LegacyCopy.edit,
        'Update how this moment appears in your Legacy.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Save',
            onPress: (value?: string) => {
              if (value?.trim()) editMomentCopy(legacyMomentId, value.trim());
            },
          },
        ],
        'plain-text',
        currentTitle,
      );
    },
    [editMomentCopy],
  );

  const list = showHidden ? hiddenMoments : moments;

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={['#12182A', '#1A2240', '#141A2E']}
        locations={[0, 0.55, 1]}
        style={StyleSheet.absoluteFill}
      />
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScrollView
          contentContainerStyle={[styles.scroll, { paddingBottom: navContentInset }]}
          showsVerticalScrollIndicator={false}>
          <Pressable
            onPress={handleBack}
            style={styles.back}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={LegacyCopy.back}>
            <SymbolView
              name={{ ios: 'chevron.left', android: 'chevron_left', web: 'chevron_left' }}
              size={18}
              tintColor="#D4AF37"
              weight="semibold"
              accessibilityElementsHidden
              importantForAccessibility="no"
            />
            <Text style={styles.backText}>{LegacyCopy.back}</Text>
          </Pressable>
          <LegacySegmentToggle active="journey" onJourney={() => {}} onRipples={openRipples} />
          <Text style={styles.title}>{LegacyCopy.screenTitle}</Text>
          <Text style={styles.hero}>{LegacyCopy.heroLine}</Text>
          <Text style={styles.sub}>{LegacyCopy.heroSub}</Text>

          <View style={styles.reelCard}>
            <GlowButton label={LegacyCopy.playReelYou} onPress={handlePlayReel} variant="secondary" />
            <Text style={styles.reelSub}>{LegacyCopy.playReelYouSub}</Text>
            <Text style={styles.reelSub}>{LegacyCopy.reelReviewNote}</Text>
          </View>

          {list.length === 0 ? (
            <View>
              <Text style={styles.emptyTitle}>{LegacyCopy.emptyTitle}</Text>
              <Text style={styles.emptyBody}>{LegacyCopy.emptyBody}</Text>
            </View>
          ) : (
            <>
              <Text style={styles.section}>
                {showHidden ? LegacyCopy.hiddenTitle : 'Your meaningful moments'}
              </Text>
              {list.map((moment) => (
                <LegacyMomentCard
                  key={moment.legacyMomentId}
                  moment={moment}
                  onHide={showHidden ? undefined : () => confirmHide(moment.legacyMomentId)}
                  onEdit={() => promptEdit(moment.legacyMomentId, moment.title)}
                  secondaryActionLabel={showHidden ? LegacyCopy.restore : undefined}
                  onSecondaryAction={
                    showHidden ? () => restoreMoment(moment.legacyMomentId) : undefined
                  }
                />
              ))}
            </>
          )}

          {hiddenMoments.length > 0 ? (
            <Pressable style={styles.toggleHidden} onPress={() => setShowHidden((value) => !value)}>
              <Text style={styles.toggleText}>
                {showHidden ? 'Back to timeline' : `${LegacyCopy.hiddenTitle} (${hiddenMoments.length})`}
              </Text>
            </Pressable>
          ) : null}

        </ScrollView>
      </SafeAreaView>
      <BottomNav />
    </View>
  );
}
