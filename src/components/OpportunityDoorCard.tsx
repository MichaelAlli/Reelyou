import { StyleSheet, Text, View } from 'react-native';

import { GlassCard } from '@/components/GlassCard';
import { Fonts, Radius, Spacing } from '@/constants/theme';
import { useThemedStyles } from '@/theme/useTheme';
import type { OpportunityDoor } from '@/types';

interface OpportunityDoorCardProps {
  door: OpportunityDoor;
}

export function OpportunityDoorCard({ door }: OpportunityDoorCardProps) {
  const styles = useThemedStyles((tokens) =>
    StyleSheet.create({
      card: {
        marginBottom: Spacing.sm,
      },
      badge: {
        alignSelf: 'flex-start',
        backgroundColor: tokens.purpleSoft,
        paddingHorizontal: Spacing.sm,
        paddingVertical: 2,
        borderRadius: Radius.full,
        marginBottom: Spacing.sm,
      },
      badgeText: {
        fontFamily: Fonts.sans,
        fontSize: 11,
        fontWeight: '700',
        color: tokens.purple,
        textTransform: 'uppercase',
      },
      title: {
        fontFamily: Fonts.sans,
        fontSize: 16,
        fontWeight: '700',
        color: tokens.primaryText,
        marginBottom: Spacing.xs,
      },
      description: {
        fontFamily: Fonts.sans,
        fontSize: 14,
        color: tokens.secondaryText,
        lineHeight: 20,
      },
    }),
  );

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
