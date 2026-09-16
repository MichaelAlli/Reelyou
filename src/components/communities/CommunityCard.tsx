import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { CommunityIcon } from '@/components/communities/CommunityIcon';
import { CommunitiesCopy } from '@/constants/communitiesCopy';
import type { CommunityDefinition } from '@/constants/communitiesData';
import { Fonts, Radius, Spacing } from '@/constants/theme';
import { useThemedStyles } from '@/theme/useTheme';

const ICON_COLORS: Record<CommunityDefinition['icon'], string> = {
  briefcase: '#C4B5FD',
  leaf: '#F5E6B8',
  creative: '#7EECD8',
  community: '#D8C4FF',
  career: '#A5C4FF',
  wellness: '#86EFAC',
  leadership: '#FCD34D',
  travel: '#93C5FD',
};

interface CommunityCardProps {
  community: CommunityDefinition;
  joined?: boolean;
  onPress: () => void;
}

export function CommunityCard({ community, joined = false, onPress }: CommunityCardProps) {
  const iconColor = ICON_COLORS[community.icon];

  const styles = useThemedStyles((tokens) =>
    StyleSheet.create({
      pressable: {
        borderRadius: Radius.lg,
        overflow: 'hidden',
        minHeight: 44,
      },
      gradient: {
        borderRadius: Radius.lg,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: 'rgba(167, 139, 250, 0.22)',
        padding: Spacing.md,
        gap: Spacing.sm,
      },
      row: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: Spacing.sm,
      },
      iconWrap: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(12, 10, 28, 0.45)',
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: 'rgba(167, 139, 250, 0.18)',
        flexShrink: 0,
      },
      body: {
        flex: 1,
        gap: 4,
      },
      titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: Spacing.sm,
      },
      name: {
        fontFamily: Fonts.serif,
        fontSize: 17,
        fontWeight: '600',
        color: tokens.primaryText,
        flex: 1,
      },
      joined: {
        fontFamily: Fonts.sans,
        fontSize: 11,
        fontWeight: '700',
        letterSpacing: 0.4,
        color: tokens.gold,
        textTransform: 'uppercase',
      },
      description: {
        fontFamily: Fonts.sans,
        fontSize: 13.5,
        lineHeight: 19,
        color: tokens.secondaryText,
      },
    }),
  );

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${community.name}. ${community.description}`}
      onPress={onPress}
      style={styles.pressable}>
      <LinearGradient
        colors={['rgba(36, 28, 68, 0.88)', 'rgba(22, 18, 42, 0.92)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}>
        <View style={styles.row}>
          <View style={styles.iconWrap}>
            <CommunityIcon type={community.icon} color={iconColor} size={20} />
          </View>
          <View style={styles.body}>
            <View style={styles.titleRow}>
              <Text style={styles.name}>{community.name}</Text>
              {joined ? <Text style={styles.joined}>{CommunitiesCopy.joinedLabel}</Text> : null}
            </View>
            <Text style={styles.description}>{community.description}</Text>
          </View>
        </View>
      </LinearGradient>
    </Pressable>
  );
}
