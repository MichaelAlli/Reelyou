import { LinearGradient } from 'expo-linear-gradient';
import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg from 'react-native-svg';

import { ApprovedReelyouStar } from '@/components/celestial/ApprovedReelyouStar';
import { SkywriteStarSemanticColors } from '@/mySky/getSkywriteStarColor';
import { Fonts } from '@/constants/theme';

interface SkyStarMeaningIntroCardProps {
  title: string;
  body: string;
  supportLine?: string;
  identityHint?: string;
  onDismiss: () => void;
  compact?: boolean;
}

function LegendRow({ color, label, sub }: { color: string; label: string; sub: string }) {
  return (
    <View style={styles.legendRow}>
      <Svg width={28} height={28}>
        <ApprovedReelyouStar id={`legend-${label}`} cx={14} cy={14} size={5.2} color={color} role="mid" />
      </Svg>
      <View style={styles.legendTextWrap}>
        <Text style={styles.legendLabel}>{label}</Text>
        <Text style={styles.legendSub}>{sub}</Text>
      </View>
    </View>
  );
}

function SkyStarMeaningIntroCardComponent({
  title,
  body,
  supportLine,
  identityHint,
  onDismiss,
  compact = false,
}: SkyStarMeaningIntroCardProps) {
  return (
    <View style={[styles.wrap, compact && styles.wrapCompact]} pointerEvents="box-none">
      <LinearGradient
        colors={['rgba(10, 14, 32, 0.97)', 'rgba(8, 12, 28, 0.94)']}
        style={styles.card}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Dismiss"
          onPress={onDismiss}
          hitSlop={10}
          style={styles.close}>
          <Text style={styles.closeGlyph}>×</Text>
        </Pressable>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.body}>{body}</Text>
        {supportLine ? <Text style={styles.support}>{supportLine}</Text> : null}
        {identityHint ? <Text style={styles.identityHint}>{identityHint}</Text> : null}
        <View style={styles.legend}>
          <LegendRow color={SkywriteStarSemanticColors.motion} label="Gold — Motion" sub="Video" />
          <LegendRow color={SkywriteStarSemanticColors.memory} label="Blue — Memory" sub="Photo" />
          <LegendRow
            color={SkywriteStarSemanticColors.reflection}
            label="Purple — Reflection"
            sub="Text"
          />
        </View>
        <Pressable accessibilityRole="button" onPress={onDismiss} style={styles.gotIt}>
          <Text style={styles.gotItText}>Got it</Text>
        </Pressable>
      </LinearGradient>
    </View>
  );
}

export const SkyStarMeaningIntroCard = memo(SkyStarMeaningIntroCardComponent);

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    zIndex: 20,
  },
  wrapCompact: { paddingVertical: 4 },
  card: {
    width: '100%',
    maxWidth: 360,
    borderRadius: 16,
    paddingTop: 14,
    paddingBottom: 12,
    paddingHorizontal: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(232, 200, 114, 0.35)',
    gap: 8,
  },
  close: { position: 'absolute', top: 8, right: 10, zIndex: 2 },
  closeGlyph: { color: 'rgba(255,248,240,0.75)', fontSize: 22, lineHeight: 22 },
  title: {
    fontFamily: Fonts.serif,
    fontSize: 18,
    color: '#FFF8F0',
    paddingRight: 24,
  },
  body: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    lineHeight: 20,
    color: 'rgba(255,248,240,0.88)',
  },
  support: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    color: 'rgba(232, 200, 114, 0.82)',
  },
  identityHint: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    fontStyle: 'italic',
    color: 'rgba(255,248,240,0.78)',
  },
  legend: { gap: 6, marginTop: 4 },
  legendRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  legendTextWrap: { flex: 1 },
  legendLabel: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255,248,240,0.9)',
  },
  legendSub: {
    fontFamily: Fonts.sans,
    fontSize: 11,
    color: 'rgba(255,248,240,0.58)',
  },
  gotIt: {
    alignSelf: 'center',
    marginTop: 4,
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(232, 200, 114, 0.45)',
  },
  gotItText: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    fontWeight: '700',
    color: '#E8C872',
  },
});
