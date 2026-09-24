import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo } from 'react';
import { BackHandler, StyleSheet, Text, useWindowDimensions } from 'react-native';

import { LegacyRippleScreenShell } from '@/components/legacy/ripple/LegacyRippleScreenShell';
import { RippleMapCanvas } from '@/components/legacy/ripple/RippleMapCanvas';
import { RippleNodeDetailPopup } from '@/components/legacy/ripple/RippleNodeDetailPopup';
import { RippleCopy } from '@/constants/rippleCopy';
import { Fonts, Spacing } from '@/constants/theme';
import { leaveLegacyRippleRoute } from '@/legacy/legacyRippleLeaveNavigation';
import { resolveRippleCenterOriginLabel } from '@/legacy/rippleCenterOrigin';
import { useRippleNodePopup } from '@/legacy/useRippleNodePopup';
import { useLegacyRippleViewModel } from '@/legacy/useLegacyRippleViewModel';

export function LegacyRippleMapScreen() {
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  const mapWidth = Math.min(width - Spacing.lg * 2, 361);
  const mapHeight = Math.min(Math.max(420, height * 0.52), 520);
  const { model, ownerUserId, metrics, userDirectory } = useLegacyRippleViewModel();
  const centerLabel = useMemo(() => resolveRippleCenterOriginLabel(), []);
  const popup = useRippleNodePopup({ ownerUserId, metrics, userDirectory });

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
    <LegacyRippleScreenShell onBack={handleBack} scroll>
      <Text style={styles.title}>{RippleCopy.mapTitle}</Text>
      <Text style={styles.subtitle}>
        The center is you — inner rings show direct impact, outer rings show how your care traveled
        further.
      </Text>
      <RippleMapCanvas
        width={mapWidth}
        height={mapHeight}
        directNodes={model.directNodes}
        downstreamNodes={model.downstreamNodes}
        showDownstream
        density="detail"
        centerOriginLabel={centerLabel}
        onNodePress={popup.openNode}
      />
      <RippleNodeDetailPopup
        visible={popup.visible}
        detail={popup.detail}
        onClose={popup.closeNode}
        fullStoryHref={
          popup.personUserId
            ? `/legacy/ripple/${encodeURIComponent(popup.personUserId)}`
            : null
        }
      />
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
  subtitle: {
    marginTop: 8,
    marginBottom: 10,
    fontFamily: Fonts.sans,
    fontSize: 13,
    lineHeight: 18,
    color: 'rgba(45, 55, 72, 0.82)',
  },
});
