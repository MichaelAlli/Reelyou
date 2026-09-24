import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo } from 'react';
import { BackHandler, StyleSheet, Text, View } from 'react-native';

import { rippleGlass } from '@/components/legacy/ripple/rippleGlass';
import { LegacyRippleScreenShell } from '@/components/legacy/ripple/LegacyRippleScreenShell';
import { RippleCopy } from '@/constants/rippleCopy';
import { Fonts } from '@/constants/theme';
import { currentUser } from '@/data/mockData';
import { buildRippleConnectionDetail } from '@/legacy/buildRippleConnectionDetail';
import { leaveLegacyRippleRoute } from '@/legacy/legacyRippleLeaveNavigation';
import { buildRippleUserDirectory } from '@/legacy/rippleUserDirectory';
import { useHumanPotentialMetrics } from '@/humanPotential/HumanPotentialMetricsProvider';

function formatDate(ms: number): string {
  try {
    return new Date(ms).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return '';
  }
}

export function LegacyRippleConnectionScreen() {
  const router = useRouter();
  const { personId } = useLocalSearchParams<{ personId: string }>();
  const decodedId = personId ? decodeURIComponent(personId) : '';
  const { state, isLoaded } = useHumanPotentialMetrics();
  const userDirectory = useMemo(() => buildRippleUserDirectory(), []);

  const detail = useMemo(() => {
    if (!decodedId || !isLoaded) return null;
    return buildRippleConnectionDetail({
      ownerUserId: currentUser.id,
      personUserId: decodedId,
      metrics: state,
      userDirectory,
    });
  }, [decodedId, isLoaded, state, userDirectory]);

  const handleBack = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    leaveLegacyRippleRoute(router);
  }, [router]);

  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      handleBack();
      return true;
    });
    return () => subscription.remove();
  }, [handleBack]);

  return (
    <LegacyRippleScreenShell onBack={handleBack}>
      <Text style={styles.title}>{RippleCopy.connectionTitle}</Text>
      {!detail ? (
        <Text style={styles.body}>Connection details are unavailable.</Text>
      ) : (
        <View style={[rippleGlass.panel, styles.card]}>
          <Text style={styles.name}>{detail.displayName}</Text>
          {detail.isDirectImpact ? (
            <Text style={styles.tag}>Direct impact — counts toward Lives Impacted</Text>
          ) : null}
          {detail.isDownstreamRipple ? (
            <Text style={styles.tagRipple}>Downstream ripple — does not add a direct life</Text>
          ) : null}
          {detail.impactEvents.map((event) => (
            <View key={event.impactEventId} style={styles.row}>
              <Text style={styles.rowTitle}>Impact confirmed</Text>
              <Text style={styles.rowBody}>{event.context?.trim() || 'Meaningful impact recorded.'}</Text>
              <Text style={styles.rowMeta}>{formatDate(event.createdAt)}</Text>
            </View>
          ))}
          {detail.ripples.map((ripple) => (
            <View key={ripple.rippleEventId} style={styles.row}>
              <Text style={styles.rowTitle}>Ripple carried forward</Text>
              <Text style={styles.rowMeta}>{formatDate(ripple.createdAt)}</Text>
            </View>
          ))}
        </View>
      )}
    </LegacyRippleScreenShell>
  );
}

const styles = StyleSheet.create({
  title: {
    marginTop: 8,
    fontFamily: Fonts.serif,
    fontSize: 24,
    fontWeight: '600',
    color: '#2D3748',
  },
  body: {
    marginTop: 12,
    fontFamily: Fonts.sans,
    fontSize: 14,
    color: 'rgba(45, 55, 72, 0.8)',
  },
  card: {
    marginTop: 14,
    padding: 16,
    gap: 12,
  },
  name: {
    fontFamily: Fonts.sans,
    fontSize: 18,
    fontWeight: '700',
    color: '#2D3748',
  },
  tag: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    fontWeight: '600',
    color: '#C47A45',
  },
  tagRipple: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    fontWeight: '600',
    color: '#8B6FD4',
  },
  row: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(45, 55, 72, 0.12)',
    paddingTop: 10,
    gap: 4,
  },
  rowTitle: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    fontWeight: '700',
    color: '#4A5568',
  },
  rowBody: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    lineHeight: 18,
    color: '#2D3748',
  },
  rowMeta: {
    fontFamily: Fonts.sans,
    fontSize: 11,
    color: 'rgba(45, 55, 72, 0.6)',
  },
});
