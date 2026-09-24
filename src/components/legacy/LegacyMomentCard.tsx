import { Image } from 'expo-image';
import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { legacySignalLabel, LegacyCopy } from '@/constants/legacyCopy';
import { Fonts, Radius, Spacing } from '@/constants/theme';
import type { LegacyMoment } from '@/legacy/legacyMomentTypes';
import { useThemedStyles } from '@/theme/useTheme';

interface LegacyMomentCardProps {
  moment: LegacyMoment;
  onHide?: () => void;
  onEdit?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
}

function formatSeason(ms: number): string {
  try {
    return new Date(ms).toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
  } catch {
    return '';
  }
}

function LegacyMomentCardComponent({
  moment,
  onHide,
  onEdit,
  secondaryActionLabel,
  onSecondaryAction,
}: LegacyMomentCardProps) {
  const styles = useThemedStyles((tokens) =>
    StyleSheet.create({
      wrap: {
        borderRadius: Radius.lg,
        overflow: 'hidden',
        marginBottom: Spacing.md,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: 'rgba(167, 139, 250, 0.22)',
      },
      gradient: { padding: Spacing.md, gap: Spacing.sm },
      metaRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
      date: { fontFamily: Fonts.sans, fontSize: 12, color: tokens.mutedText },
      signal: {
        fontFamily: Fonts.sans,
        fontSize: 11,
        fontWeight: '600',
        color: tokens.gold,
        textTransform: 'uppercase',
        letterSpacing: 0.6,
      },
      title: {
        fontFamily: Fonts.serif,
        fontSize: 20,
        fontWeight: '600',
        color: tokens.primaryText,
        lineHeight: 26,
      },
      summary: {
        fontFamily: Fonts.sans,
        fontSize: 14,
        lineHeight: 20,
        color: tokens.secondaryText,
      },
      people: { fontFamily: Fonts.sans, fontSize: 12, color: tokens.mutedText },
      mediaRow: { flexDirection: 'row', gap: Spacing.sm, alignItems: 'center' },
      thumb: { width: 72, height: 72, borderRadius: Radius.md, backgroundColor: 'rgba(255,255,255,0.06)' },
      rippleTrail: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginTop: 4,
      },
      rippleDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: tokens.gold, opacity: 0.85 },
      rippleLine: { flex: 1, height: 1, backgroundColor: 'rgba(212, 175, 55, 0.35)' },
      actions: { flexDirection: 'row', gap: 16, marginTop: 4 },
      action: { fontFamily: Fonts.sans, fontSize: 12, fontWeight: '600', color: tokens.gold },
    }),
  );

  const media = moment.mediaRefs;
  const showPhoto = media?.photoUri && !moment.sourceContentDeleted;
  const peopleLine = moment.peopleRefs?.map((person) => person.displayName).join(' · ');

  return (
    <View style={styles.wrap}>
      <LinearGradient colors={['rgba(30, 22, 48, 0.92)', 'rgba(12, 10, 22, 0.96)']} style={styles.gradient}>
        <View style={styles.metaRow}>
          <Text style={styles.date}>{formatSeason(moment.occurredAt)}</Text>
          <Text style={styles.signal}>{legacySignalLabel(moment.eventType)}</Text>
        </View>
        <Text style={styles.title}>{moment.title}</Text>
        <Text style={styles.summary}>{moment.shortSummary}</Text>
        {peopleLine ? <Text style={styles.people}>{peopleLine}</Text> : null}
        {showPhoto ? (
          <View style={styles.mediaRow}>
            <Image source={{ uri: media!.photoUri! }} style={styles.thumb} contentFit="cover" />
          </View>
        ) : null}
        {moment.rippleVisual === 'downstream' ? (
          <View style={styles.rippleTrail}>
            <View style={styles.rippleDot} />
            <View style={styles.rippleLine} />
            <View style={[styles.rippleDot, { opacity: 0.55 }]} />
            <View style={[styles.rippleDot, { opacity: 0.35 }]} />
          </View>
        ) : null}
        {(onHide || onEdit || onSecondaryAction) && (
          <View style={styles.actions}>
            {onEdit ? (
              <Pressable onPress={onEdit} hitSlop={8}>
                <Text style={styles.action}>{LegacyCopy.edit}</Text>
              </Pressable>
            ) : null}
            {onHide ? (
              <Pressable onPress={onHide} hitSlop={8}>
                <Text style={styles.action}>{LegacyCopy.hide}</Text>
              </Pressable>
            ) : null}
            {onSecondaryAction && secondaryActionLabel ? (
              <Pressable onPress={onSecondaryAction} hitSlop={8}>
                <Text style={styles.action}>{secondaryActionLabel}</Text>
              </Pressable>
            ) : null}
          </View>
        )}
      </LinearGradient>
    </View>
  );
}

export const LegacyMomentCard = memo(LegacyMomentCardComponent);
