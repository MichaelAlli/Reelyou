import { StyleSheet, Text, View } from 'react-native';

import { GlassCard } from '@/components/GlassCard';
import { CosmicTheme, Fonts, Radius, Spacing } from '@/constants/theme';
import type { OpportunityDoor } from '@/types';

interface OpportunityDoorCardProps {
  door: OpportunityDoor;
}

export function OpportunityDoorCard({ door }: OpportunityDoorCardProps) {
  return (
    <GlassCard style={styles.card}>
      <View style={styles.badge}>
        <Text style={styles.badgeText}>{door.type}</Text>
      </View>
      <Text style={styles.title}>{door.title}</Text>
      <Text style={styles.description}>{door.description}</Text>
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: Spacing.sm,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: CosmicTheme.purpleSoft,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: Radius.full,
    marginBottom: Spacing.sm,
  },
  badgeText: {
    fontFamily: Fonts.sans,
    fontSize: 11,
    fontWeight: '700',
    color: CosmicTheme.purple,
    textTransform: 'uppercase',
  },
  title: {
    fontFamily: Fonts.sans,
    fontSize: 16,
    fontWeight: '700',
    color: CosmicTheme.textPrimary,
    marginBottom: Spacing.xs,
  },
  description: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    color: CosmicTheme.textSecondary,
    lineHeight: 20,
  },
});
