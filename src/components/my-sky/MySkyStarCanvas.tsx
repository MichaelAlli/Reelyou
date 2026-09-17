import { useRouter } from 'expo-router';
import { memo, useCallback, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { MySkyBackdrop } from '@/components/my-sky/MySkyBackdrop';
import { MySkyLayerControls } from '@/components/my-sky/MySkyLayerControls';
import { MySkyRenderer } from '@/components/my-sky/MySkyRenderer';
import { MySkyCopy } from '@/constants/mySkyCopy';
import { Fonts, Radius, Spacing } from '@/constants/theme';
import { resolveStarNavigation } from '@/mySky/resolveStarNavigation';
import type { MySkyLayerId } from '@/mySky/skyLayers';
import type { MySkyStarDisplay, MySkyView } from '@/mySky/types';
import { useOnboarding } from '@/onboarding';
import { useThemedStyles } from '@/theme/useTheme';

interface MySkyStarCanvasProps {
  view: Pick<MySkyView, 'stars' | 'vitality' | 'relationships' | 'nodes' | 'viewState'>;
  onToggleLayer: (layer: MySkyLayerId) => void;
  onRevealConstellations: () => void;
  constellationRevealCount: number;
  constellationRevealActive?: boolean;
}

function MySkyStarCanvasComponent({
  view,
  onToggleLayer,
  onRevealConstellations,
  constellationRevealCount,
  constellationRevealActive = false,
}: MySkyStarCanvasProps) {
  const { stars, viewState } = view;
  const router = useRouter();
  const { skywrites } = useOnboarding();

  const styles = useThemedStyles((tokens) =>
    StyleSheet.create({
      outer: {
        gap: Spacing.sm,
      },
      wrap: {
        width: '100%',
        aspectRatio: 0.72,
        minHeight: 320,
        borderRadius: Radius.lg,
        overflow: 'hidden',
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: 'rgba(167, 139, 250, 0.22)',
      },
      starHit: {
        position: 'absolute',
        width: 44,
        height: 44,
        marginLeft: -22,
        marginTop: -22,
        alignItems: 'center',
        justifyContent: 'center',
      },
      hitGlow: {
        width: 20,
        height: 20,
        borderRadius: 10,
        opacity: 0.01,
      },
      tooltip: {
        position: 'absolute',
        bottom: 8,
        left: 8,
        right: 8,
        padding: 8,
        borderRadius: Radius.md,
        backgroundColor: 'rgba(12, 10, 28, 0.88)',
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: tokens.border,
      },
      tooltipText: {
        fontFamily: Fonts.sans,
        fontSize: 12,
        lineHeight: 16,
        color: tokens.primaryText,
      },
      missingHint: {
        fontFamily: Fonts.sans,
        fontSize: 11,
        lineHeight: 15,
        color: tokens.mutedText,
        paddingHorizontal: 2,
      },
    }),
  );

  const [activeId, setActiveId] = useState<string | null>(null);
  const [missingHint, setMissingHint] = useState<string | null>(null);
  const active = stars.find((s) => s.id === activeId);

  const handleStarPress = useCallback(
    (star: MySkyStarDisplay) => {
      setActiveId(star.id);
      setMissingHint(null);

      const target = resolveStarNavigation(star, skywrites);

      switch (target.kind) {
        case 'skywrite-detail':
          router.push(`/skywrite/${target.skywriteId}` as never);
          return;
        case 'skywrite-compose':
          router.push('/skywrite' as never);
          return;
        case 'public-sky':
          router.push(`/public-sky?id=${target.param}` as never);
          return;
        case 'none':
          if (target.reason === 'missing-skywrite') {
            setMissingHint(MySkyCopy.starMissingToast);
          }
          return;
        default:
          return;
      }
    },
    [router, skywrites],
  );

  return (
    <View style={styles.outer}>
      <MySkyLayerControls
        visibleLayers={viewState.visibleLayers}
        onToggleLayer={onToggleLayer}
        onRevealConstellations={onRevealConstellations}
        constellationRevealActive={constellationRevealActive}
      />
      <View style={styles.wrap}>
        <MySkyBackdrop dim />
        <MySkyRenderer
          view={view}
          mode="resting"
          constellationRevealCount={constellationRevealCount}
        />

        {stars.map((star) => (
          <Pressable
            key={star.id}
            accessibilityRole="button"
            accessibilityLabel={
              star.type === 'skywrite' && star.sourceId
                ? `Open skywrite: ${star.title ?? 'moment'}`
                : star.title ?? 'Sky moment'
            }
            onPress={() => handleStarPress(star)}
            style={[styles.starHit, { left: `${star.x * 100}%`, top: `${star.y * 100}%` }]}>
            <View style={styles.hitGlow} />
          </Pressable>
        ))}

        {active?.title && !missingHint ? (
          <View style={styles.tooltip} pointerEvents="none">
            <Text style={styles.tooltipText}>{active.title}</Text>
          </View>
        ) : null}
      </View>
      {missingHint ? <Text style={styles.missingHint}>{missingHint}</Text> : null}
    </View>
  );
}

export const MySkyStarCanvas = memo(MySkyStarCanvasComponent);
