import { Platform, StyleSheet, type ViewStyle } from 'react-native';

import { Spacing } from '@/constants/theme';

/** Shared dark-glass control styling — aligned with REELYOU BottomNav / chrome. */
export const StarPathGlass = {
  controlSize: 44,
  controlRadius: 22,
  controlBg: 'rgba(3, 5, 14, 0.86)',
  controlBorder: 'rgba(232, 200, 114, 0.28)',
  controlBorderMuted: 'rgba(255, 244, 214, 0.14)',
  cardBg: 'rgba(3, 5, 14, 0.92)',
  cardBorder: 'rgba(232, 200, 114, 0.34)',
  cardRadius: 22,
  guideAccentBorder: 'rgba(140, 120, 255, 0.36)',
  backdropDim: 'rgba(2, 4, 12, 0.38)',
} as const;

/** Repeatable layout rhythm for StarPath chrome (393×852 reference). */
export const StarPathSpacing = {
  screenEdge: Spacing.three,
  screenEdgeWide: Spacing.four,
  guideTop: 96,
  guideLeft: Spacing.three,
  headerBottom: Spacing.one + 2,
  controlGap: Spacing.two,
} as const;

export const StarPathTypography = {
  warmWhite: 'rgba(255, 248, 235, 0.94)',
  warmSoft: 'rgba(255, 248, 235, 0.88)',
  mutedLilac: 'rgba(196, 168, 255, 0.82)',
  kicker: {
    fontSize: 8,
    letterSpacing: 1.35,
    fontWeight: '700' as const,
  },
  caption: {
    fontSize: 10,
    lineHeight: 14,
  },
} as const;

export const starpathCardShadow: ViewStyle =
  Platform.OS === 'web'
    ? ({ boxShadow: '0 6px 20px rgba(0, 0, 0, 0.38)' } as ViewStyle)
    : {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.32,
        shadowRadius: 10,
        elevation: 6,
      };

export const starpathGlassControl = StyleSheet.create({
  base: {
    width: StarPathGlass.controlSize,
    height: StarPathGlass.controlSize,
    borderRadius: StarPathGlass.controlRadius,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: StarPathGlass.controlBg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: StarPathGlass.controlBorder,
  },
  pressed: {
    opacity: 0.88,
    transform: [{ scale: 0.97 }],
  },
});
