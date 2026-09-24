import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo } from 'react';
import { BackHandler, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import { LegacyRippleScreenShell } from '@/components/legacy/ripple/LegacyRippleScreenShell';
import { RippleMapCanvas } from '@/components/legacy/ripple/RippleMapCanvas';
import { RippleNodeDetailPopup } from '@/components/legacy/ripple/RippleNodeDetailPopup';
import { RippleCopy } from '@/constants/rippleCopy';
import { Fonts, Spacing } from '@/constants/theme';
import { currentUser, orbitUsers } from '@/data/mockData';
import { resolveRippleCenterOriginLabel } from '@/legacy/rippleCenterOrigin';
import { useRippleNodePopup } from '@/legacy/useRippleNodePopup';
import { useSubjectRippleViewModel } from '@/legacy/useSubjectRippleViewModel';
import { buildVisitorProfileHref } from '@/profile/visitorProfileRoute';
import { visitorRippleRoute } from '@/profile/visitorLegacyRoutes';

interface VisitorRippleMapScreenProps {
  ownerId?: string;
}

export function VisitorRippleMapScreen({ ownerId }: VisitorRippleMapScreenProps) {
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  const mapWidth = Math.min(width - Spacing.lg * 2, 361);
  const mapHeight = Math.min(Math.max(420, height * 0.52), 520);
  const subjectId = ownerId ?? '';
  const { model, ownerUserId, metrics, userDirectory, accessAllowed } =
    useSubjectRippleViewModel(subjectId);
  const popup = useRippleNodePopup({ ownerUserId, metrics, userDirectory });

  const subjectUser = useMemo(
    () => orbitUsers.find((entry) => entry.id === subjectId) ?? currentUser,
    [subjectId],
  );
  const centerLabel = useMemo(() => resolveRippleCenterOriginLabel(subjectUser as typeof currentUser), [subjectUser]);

  const handleBack = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    if (subjectId) {
      router.replace(visitorRippleRoute(subjectId) as never);
      return;
    }
    router.replace(buildVisitorProfileHref(subjectId) as never);
  }, [router, subjectId]);

  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      handleBack();
      return true;
    });
    return () => subscription.remove();
  }, [handleBack]);

  if (!subjectId || !accessAllowed) {
    return (
      <View style={styles.blocked}>
        <Text style={styles.blockedText}>Profile unavailable.</Text>
      </View>
    );
  }

  return (
    <LegacyRippleScreenShell onBack={handleBack} scroll>
      <Text style={styles.title}>{RippleCopy.mapTitle}</Text>
      <Text style={styles.subtitle}>
        The center is them — inner rings show direct impact, outer rings show how their care traveled
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
      <RippleNodeDetailPopup visible={popup.visible} detail={popup.detail} onClose={popup.closeNode} />
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
  blocked: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  blockedText: { fontFamily: Fonts.sans, fontSize: 14, color: '#2D3748' },
});
