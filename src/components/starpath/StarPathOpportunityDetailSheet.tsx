import { memo } from 'react';
import { Linking, Modal, Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { StarPathTypography, starpathCardShadow } from '@/components/starpath/starpathGlass';
import { Fonts } from '@/constants/theme';
import type { OpportunityCandidate } from '@/starpath/starpathOpportunityTypes';
import type { StarPathThemeTokens } from '@/starpath/starpathTheme';
import { calmDeadlinePhrase } from '@/starpath/starpathTimeSensitivity';

interface StarPathOpportunityDetailSheetProps {
  visible: boolean;
  theme: StarPathThemeTokens;
  candidate: OpportunityCandidate | null;
  whyHere?: string | null;
  saved: boolean;
  onClose: () => void;
  onSave: () => void;
  onDismiss: () => void;
  onSnooze: () => void;
  onInterested: () => void;
}

function StarPathOpportunityDetailSheetComponent({
  visible,
  theme,
  candidate,
  whyHere,
  saved,
  onClose,
  onSave,
  onDismiss,
  onSnooze,
  onInterested,
}: StarPathOpportunityDetailSheetProps) {
  if (!candidate) return null;

  const deadline = candidate.deadline ?? candidate.registrationDeadline;
  const deadlineLine = deadline ? calmDeadlinePhrase(deadline, Date.now()) : null;
  const officialUrl = candidate.officialUrl ?? candidate.sourceUrl;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel="Close opportunity detail" />
      <View style={styles.anchor} pointerEvents="box-none">
        <View style={styles.panel} testID="starpath-opportunity-detail">
          {candidate.fixtureOnly ? (
            <Text style={[styles.fixtureBadge, { color: theme.labelMuted }]}>FIXTURE-ONLY preview</Text>
          ) : null}
          <Text style={[styles.kicker, { color: theme.labelMuted }]}>
            {candidate.opportunityType.replace('_', ' ').toUpperCase()}
          </Text>
          <Text style={[styles.title, { color: theme.labelBright }]}>{candidate.title}</Text>
          <Text style={[styles.body, { color: StarPathTypography.mutedLilac }]}>{candidate.description}</Text>

          <Text style={[styles.section, { color: theme.labelMuted }]}>Why is it here?</Text>
          <Text style={[styles.body, { color: theme.labelBright }]}>
            {whyHere ?? 'It may connect with paths you have been exploring.'}
          </Text>

          <Text style={[styles.section, { color: theme.labelMuted }]}>What should I know?</Text>
          {candidate.provider ? (
            <Text style={[styles.meta, { color: theme.labelBright }]}>Provider: {candidate.provider}</Text>
          ) : null}
          {candidate.location ? (
            <Text style={[styles.meta, { color: theme.labelBright }]}>
              Location: {candidate.location}
              {candidate.remoteAvailable ? ' · Remote options' : ''}
            </Text>
          ) : null}
          {candidate.cost ? (
            <Text style={[styles.meta, { color: theme.labelBright }]}>Cost: {candidate.cost}</Text>
          ) : null}
          {deadlineLine ? (
            <Text style={[styles.meta, { color: theme.pathGold }]}>{deadlineLine}</Text>
          ) : null}
          {candidate.eligibilitySummary ? (
            <Text style={[styles.meta, { color: theme.labelBright }]}>
              Eligibility: {candidate.eligibilitySummary}
            </Text>
          ) : null}
          <Text style={[styles.meta, { color: theme.labelMuted }]}>
            Source: {candidate.sourceName}
            {candidate.lastVerifiedAt
              ? ` · Verified ${new Date(candidate.lastVerifiedAt).toLocaleDateString()}`
              : ''}
          </Text>
          <Text style={[styles.caution, { color: theme.labelMuted }]}>
            You may want to review this opportunity on the official site before applying.
          </Text>

          <View style={styles.actions}>
            {officialUrl ? (
              <ActionChip
                label="Visit official site"
                onPress={() => void Linking.openURL(officialUrl)}
                theme={theme}
                primary
              />
            ) : null}
            {!saved ? <ActionChip label="Save for later" onPress={onSave} theme={theme} /> : null}
            <ActionChip label="Interested" onPress={onInterested} theme={theme} />
            <ActionChip label="Remind me later" onPress={onSnooze} theme={theme} />
            <ActionChip label="Not for me" onPress={onDismiss} theme={theme} muted />
          </View>

          <Pressable onPress={onClose} style={styles.close} accessibilityRole="button" accessibilityLabel="Close">
            <Text style={[styles.closeText, { color: theme.labelBright }]}>Close</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

function ActionChip({
  label,
  onPress,
  theme,
  primary,
  muted,
}: {
  label: string;
  onPress: () => void;
  theme: StarPathThemeTokens;
  primary?: boolean;
  muted?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        primary && { borderColor: theme.pathGold },
        muted && styles.chipMuted,
        pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] },
      ]}
    >
      <Text style={[styles.chipText, { color: primary ? theme.pathGold : theme.labelBright }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(2, 4, 12, 0.62)',
  },
  anchor: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 36 : 24,
  },
  panel: {
    borderRadius: 20,
    padding: 20,
    backgroundColor: 'rgba(8, 12, 28, 0.94)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    ...starpathCardShadow,
  },
  fixtureBadge: {
    fontFamily: Fonts.sans,
    fontSize: 10,
    letterSpacing: 1,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  kicker: {
    fontFamily: Fonts.sans,
    fontSize: 11,
    letterSpacing: 1.2,
    marginBottom: 6,
  },
  title: {
    fontFamily: Fonts.serif,
    fontSize: 22,
    marginBottom: 10,
  },
  body: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  section: {
    fontFamily: Fonts.sans,
    fontSize: 11,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginTop: 10,
    marginBottom: 4,
  },
  meta: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 4,
  },
  caution: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    lineHeight: 17,
    marginTop: 6,
    fontStyle: 'italic',
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 16,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
  },
  chipMuted: {
    borderColor: 'rgba(255,255,255,0.1)',
  },
  chipText: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    fontWeight: '600',
  },
  close: {
    marginTop: 14,
    alignSelf: 'center',
    paddingVertical: 8,
  },
  closeText: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    fontWeight: '600',
  },
});

export const StarPathOpportunityDetailSheet = memo(StarPathOpportunityDetailSheetComponent);
