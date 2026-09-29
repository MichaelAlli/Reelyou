/** LOCKED SPATIAL FOCUS NAVIGATION — preserve left/right focus behavior, canonical ID reuse, no-auto-open behavior, and current visual treatment unless explicitly approved. */
import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { Fonts } from '@/constants/theme';
import { SpatialFocusContextProvider } from '@/spatialFocus/SpatialFocusContext';
import {
  markSpatialFocusHintShown,
  spatialFocusHintCopy,
  wasSpatialFocusHintShown,
} from '@/spatialFocus/spatialFocusHintPersistence';
import type { SpatialFocusCandidate, SpatialFocusHintSurface } from '@/spatialFocus/types';
import { SPATIAL_FOCUS_EDGE_WIDTH_RATIO } from '@/spatialFocus/types';
import {
  logSpatialFocusLeftEdgeTap,
  logSpatialFocusRightEdgeTap,
} from '@/spatialFocus/spatialFocusDevLog';
import { SpatialFocusFloatingNav } from '@/spatialFocus/SpatialFocusFloatingNav';
import { useSpatialFocusNavigator } from '@/spatialFocus/useSpatialFocusNavigator';

interface SpatialFocusHostProps {
  layoutWidth: number;
  layoutHeight: number;
  candidates: SpatialFocusCandidate[];
  disabled?: boolean;
  hintSurface?: SpatialFocusHintSurface;
  topInset?: number;
  bottomInset?: number;
  children?: React.ReactNode;
  /** Render only edge/ring layers over an existing sibling (My Sky / StarPath). */
  overlayMode?: boolean;
  showFloatingNav?: boolean;
  floatingNavBottom?: number;
  onRegisterClear?: (clear: (() => void) | null) => void;
  onSelectionChange?: (selectedId: string | null) => void;
}

function SpatialFocusHostComponent({
  layoutWidth,
  layoutHeight,
  candidates,
  disabled = false,
  hintSurface,
  topInset = 0,
  bottomInset = 0,
  children,
  overlayMode = false,
  showFloatingNav = false,
  floatingNavBottom = 96,
  onRegisterClear,
  onSelectionChange,
}: SpatialFocusHostProps) {
  const layout = useMemo(
    () => ({ width: layoutWidth, height: layoutHeight }),
    [layoutHeight, layoutWidth],
  );
  const navigator = useSpatialFocusNavigator(candidates, layout);
  const { selectedCandidate, navigateLeft, navigateRight, clearFocus, noCandidatePulse } =
    navigator;

  const edgeWidth = Math.max(36, Math.round(layoutWidth * SPATIAL_FOCUS_EDGE_WIDTH_RATIO));

  const [hintVisible, setHintVisible] = useState(false);
  const [edgeRejectPulse, setEdgeRejectPulse] = useState(false);

  useEffect(() => {
    if (disabled || !hintSurface || layoutWidth <= 0) return;
    let cancelled = false;
    void wasSpatialFocusHintShown(hintSurface).then((shown) => {
      if (!cancelled && !shown) setHintVisible(true);
    });
    return () => {
      cancelled = true;
    };
  }, [disabled, hintSurface, layoutWidth]);

  useEffect(() => {
    if (noCandidatePulse <= 0) return;
    setEdgeRejectPulse(true);
    const timer = setTimeout(() => setEdgeRejectPulse(false), 320);
    return () => clearTimeout(timer);
  }, [noCandidatePulse]);

  useEffect(() => {
    if (disabled) clearFocus();
  }, [clearFocus, disabled]);

  useEffect(() => {
    if (!onRegisterClear) return;
    onRegisterClear(clearFocus);
    return () => onRegisterClear(null);
  }, [clearFocus, onRegisterClear]);

  useEffect(() => {
    onSelectionChange?.(selectedCandidate?.id ?? null);
  }, [onSelectionChange, selectedCandidate?.id]);

  const dismissHint = useCallback(() => {
    setHintVisible(false);
    if (hintSurface) void markSpatialFocusHintShown(hintSurface);
  }, [hintSurface]);

  const onLeftEdge = useCallback(() => {
    if (disabled) return;
    logSpatialFocusLeftEdgeTap();
    const moved = navigateLeft();
    if (moved) dismissHint();
  }, [disabled, dismissHint, navigateLeft]);

  const onRightEdge = useCallback(() => {
    if (disabled) return;
    logSpatialFocusRightEdgeTap();
    const moved = navigateRight();
    if (moved) dismissHint();
  }, [disabled, dismissHint, navigateRight]);

  if (layoutWidth <= 0 || layoutHeight <= 0) {
    return overlayMode ? null : <>{children}</>;
  }

  const zoneTop = topInset;
  const zoneHeight = Math.max(0, layoutHeight - topInset - bottomInset);

  const edgeChrome = !disabled ? (
    <>
      <View style={[StyleSheet.absoluteFill, styles.edgeLayer]} pointerEvents="box-none">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Focus previous nearby object"
          onPress={onLeftEdge}
          collapsable={false}
          style={[
            styles.edge,
            {
              left: 0,
              top: zoneTop,
              width: edgeWidth,
              height: zoneHeight,
              opacity: edgeRejectPulse ? 0.35 : 1,
            },
          ]}
        />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Focus next nearby object"
          onPress={onRightEdge}
          collapsable={false}
          style={[
            styles.edge,
            {
              right: 0,
              top: zoneTop,
              width: edgeWidth,
              height: zoneHeight,
              opacity: edgeRejectPulse ? 0.35 : 1,
            },
          ]}
        />
      </View>
      {selectedCandidate ? (
        <View
          pointerEvents="none"
          style={[
            styles.focusOverlayLayer,
            styles.focusRing,
            {
              left: selectedCandidate.centerX - 26,
              top: selectedCandidate.centerY - 26,
            },
          ]}
        />
      ) : null}
      {hintVisible && hintSurface ? (
        <View
          style={[
            styles.hintWrap,
            styles.hintLayer,
            {
              top: zoneTop + Math.round(zoneHeight * 0.36),
              bottom: undefined,
            },
          ]}
          pointerEvents="box-none">
          <View style={styles.hintCard}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Dismiss edge navigation tip"
              onPress={dismissHint}
              hitSlop={10}
              style={({ pressed }) => [styles.hintClose, pressed && styles.hintClosePressed]}>
              <Text style={styles.hintCloseGlyph} accessibilityElementsHidden>
                ×
              </Text>
            </Pressable>
            <Text style={styles.hintText} maxFontSizeMultiplier={1.35}>
              {spatialFocusHintCopy(hintSurface)}
            </Text>
          </View>
        </View>
      ) : null}
      {showFloatingNav ? (
        <SpatialFocusFloatingNav
          bottom={floatingNavBottom}
          disabled={disabled}
          onLeft={onLeftEdge}
          onRight={onRightEdge}
        />
      ) : null}
    </>
  ) : null;

  if (overlayMode) {
    return (
      <SpatialFocusContextProvider value={{ clearFocus }}>
        <View style={[StyleSheet.absoluteFill, styles.overlayStack]} pointerEvents="box-none">
          {edgeChrome}
        </View>
      </SpatialFocusContextProvider>
    );
  }

  return (
    <SpatialFocusContextProvider value={{ clearFocus }}>
      <View style={styles.host} pointerEvents="box-none">
        {children}
        {edgeChrome}
      </View>
    </SpatialFocusContextProvider>
  );
}

export const SpatialFocusHost = memo(SpatialFocusHostComponent);

const styles = StyleSheet.create({
  host: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlayStack: {
    zIndex: 32,
    ...(Platform.OS === 'android' ? { elevation: 32 } : null),
  },
  edgeLayer: {
    zIndex: 32,
    ...(Platform.OS === 'android' ? { elevation: 32 } : null),
  },
  edge: {
    position: 'absolute',
    backgroundColor: 'transparent',
  },
  focusOverlayLayer: {
    position: 'absolute',
    zIndex: 34,
  },
  hintLayer: {
    zIndex: 36,
  },
  focusRing: {
    position: 'absolute',
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 1.5,
    borderColor: 'rgba(232, 200, 114, 0.72)',
    backgroundColor: 'rgba(232, 200, 114, 0.08)',
    shadowColor: '#E8C872',
    shadowOpacity: 0.45,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
  },
  hintWrap: {
    position: 'absolute',
    left: 16,
    right: 16,
    alignItems: 'center',
  },
  hintCard: {
    width: '100%',
    maxWidth: 300,
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 10,
    borderRadius: 14,
    backgroundColor: 'rgba(8, 10, 22, 0.9)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(232, 200, 114, 0.32)',
  },
  hintClose: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  hintClosePressed: { opacity: 0.85 },
  hintCloseGlyph: {
    fontFamily: Fonts.sans,
    fontSize: 18,
    lineHeight: 20,
    color: 'rgba(248, 244, 236, 0.72)',
  },
  hintText: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    lineHeight: 17,
    color: 'rgba(248, 244, 236, 0.9)',
    textAlign: 'center',
    paddingHorizontal: 18,
  },
});
