import { useRouter } from 'expo-router';
import { memo, useCallback } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useReelyouConnect } from '@/connect/ReelyouConnectProvider';
import { HomePalette } from '@/constants/homeLayout';
import { Fonts } from '@/constants/theme';
import { aroundYourSkyHomeSignalIds } from '@/signals/homeSignalPresentation';
import type { AroundYourSkyDisplayItem } from '@/social/aroundYourSky';
import { useThemedStyles } from '@/theme/useTheme';

interface AroundYourSkyActivityItemProps {
  item: AroundYourSkyDisplayItem;
}

function AroundYourSkyActivityItemComponent({ item }: AroundYourSkyActivityItemProps) {
  const router = useRouter();
  const { canMessageUser, openOrCreateThreadWith, markHomePresentationOpened } =
    useReelyouConnect();
  const tappable = Boolean(item.destination);
  const messageEligible = Boolean(item.actorId && canMessageUser(item.actorId));

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
      messageLink: {
        alignSelf: 'flex-start',
        marginTop: 6,
        paddingVertical: 4,
        paddingHorizontal: 2,
        minHeight: 44,
        justifyContent: 'center',
      },
      messageLinkText: {
        fontFamily: Fonts.sans,
        fontSize: 12,
        fontWeight: '600',
        color: 'rgba(196, 181, 253, 0.95)',
      },
      pressed: {
        opacity: 0.88,
      },
    }),
  );

  const handleMessage = useCallback(() => {
    if (!item.actorId) return;
    const threadId = openOrCreateThreadWith(item.actorId);
    if (threadId) {
      router.push(`/messages/${threadId}` as never);
    }
  }, [item.actorId, openOrCreateThreadWith, router]);

  const handlePress = useCallback(() => {
    if (!item.destination) return;
    markHomePresentationOpened(aroundYourSkyHomeSignalIds(item));
    if (item.destination === 'skywrite') {
      if (item.contentId) {
        router.push(`/skywrite/${item.contentId}` as never);
      } else {
        router.push('/skywrite' as never);
      }
      return;
    }
    if (item.destination === 'community' && item.destinationParam) {
      router.push(`/community?id=${item.destinationParam}` as never);
      return;
    }
    if (item.destination === 'public-sky' && item.destinationParam) {
      router.push(`/public-sky?id=${item.destinationParam}` as never);
    }
  }, [item, markHomePresentationOpened, router]);

  const messageAction = messageEligible ? (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Message ${item.actorName}`}
      onPress={handleMessage}
      style={styles.messageLink}
    >
      <Text style={styles.messageLinkText}>Message</Text>
    </Pressable>
  ) : null;

  const bodyText = (
    <>
      <Text style={styles.message}>{item.message}</Text>
      {item.preview ? <Text style={styles.preview} numberOfLines={2}>{item.preview}</Text> : null}
      <Text style={styles.time}>{item.relativeTime}</Text>
    </>
  );

  return (
    <View style={styles.row}>
      <View style={[styles.avatar, { backgroundColor: item.actorColor }]}>
        <Text style={styles.initials}>{item.actorInitials}</Text>
      </View>
      <View style={styles.body}>
        {tappable ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`${item.message} ${item.relativeTime}`}
            onPress={handlePress}
            style={({ pressed }) => [pressed && styles.pressed]}
          >
            {bodyText}
          </Pressable>
        ) : (
          <View accessibilityRole="text">{bodyText}</View>
        )}
        {messageAction}
      </View>
    </View>
  );
}

export const AroundYourSkyActivityItem = memo(AroundYourSkyActivityItemComponent);
