import { useRouter } from 'expo-router';
import { memo, useCallback } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { HomePalette } from '@/constants/homeLayout';
import { Fonts } from '@/constants/theme';
import type { AroundYourSkyDisplayItem } from '@/social/aroundYourSky';
import { useThemedStyles } from '@/theme/useTheme';

interface AroundYourSkyActivityItemProps {
  item: AroundYourSkyDisplayItem;
}

function AroundYourSkyActivityItemComponent({ item }: AroundYourSkyActivityItemProps) {
  const router = useRouter();
  const tappable = Boolean(item.destination);

  const styles = useThemedStyles((tokens) =>
    StyleSheet.create({
      row: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 10,
        paddingVertical: 10,
        minHeight: 44,
      },
      avatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: 'rgba(167, 139, 250, 0.22)',
        flexShrink: 0,
      },
      initials: {
        fontFamily: Fonts.sans,
        fontSize: 11,
        fontWeight: '700',
        color: HomePalette.textPrimary,
      },
      body: {
        flex: 1,
        gap: 3,
        minWidth: 0,
      },
      message: {
        fontFamily: Fonts.sans,
        fontSize: 13.5,
        lineHeight: 18,
        fontWeight: '500',
        color: HomePalette.textPrimary,
      },
      preview: {
        fontFamily: Fonts.sans,
        fontSize: 12,
        lineHeight: 16,
        color: tokens.secondaryText,
      },
      time: {
        fontFamily: Fonts.sans,
        fontSize: 11,
        color: tokens.mutedText,
        marginTop: 1,
      },
      pressed: {
        opacity: 0.88,
      },
    }),
  );

  const handlePress = useCallback(() => {
    if (!item.destination) return;
    if (item.destination === 'skywrite') {
      router.push('/skywrite' as never);
      return;
    }
    if (item.destination === 'community' && item.destinationParam) {
      router.push(`/community?id=${item.destinationParam}` as never);
      return;
    }
    if (item.destination === 'public-sky' && item.destinationParam) {
      router.push(`/public-sky?id=${item.destinationParam}` as never);
    }
  }, [item.destination, item.destinationParam, router]);

  const content = (
    <>
      <View style={[styles.avatar, { backgroundColor: item.actorColor }]}>
        <Text style={styles.initials}>{item.actorInitials}</Text>
      </View>
      <View style={styles.body}>
        <Text style={styles.message}>{item.message}</Text>
        {item.preview ? <Text style={styles.preview} numberOfLines={2}>{item.preview}</Text> : null}
        <Text style={styles.time}>{item.relativeTime}</Text>
      </View>
    </>
  );

  if (!tappable) {
    return (
      <View style={styles.row} accessibilityRole="text">
        {content}
      </View>
    );
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${item.message} ${item.relativeTime}`}
      onPress={handlePress}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
      {content}
    </Pressable>
  );
}

export const AroundYourSkyActivityItem = memo(AroundYourSkyActivityItemComponent);
