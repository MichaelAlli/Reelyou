import { Image } from 'expo-image';
import { memo, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { SkywriteAudioWaveform } from '@/components/skywrite/SkywriteAudioWaveform';
import { Fonts, Radius } from '@/constants/theme';
import {
  formatSkywriteAudioDuration,
  pickSkywriteMediaSource,
  skywritePreviewExcerpt,
} from '@/skywrite/media/skywriteMediaPreviewUtils';
import type { SkywriteRecord } from '@/skywrite/types';

export type SkywriteMediaPreviewVariant = 'library' | 'invitationCard' | 'invitationList';

interface SkywriteMediaPreviewProps {
  skywrite: Pick<SkywriteRecord, 'id' | 'text' | 'media' | 'mediaMode'>;
  variant: SkywriteMediaPreviewVariant;
  previewIdPrefix?: string;
  excerpt?: string;
  onToggleAudio?: (previewId: string, uri: string) => void;
  isAudioPlaying?: (previewId: string) => boolean;
  /** When false, audio rows are static (avoids nested buttons inside list row pressables). */
  allowAudioPreview?: boolean;
  style?: StyleProp<ViewStyle>;
}

function thumbnailSize(variant: SkywriteMediaPreviewVariant): { width: number; height: number } | null {
  if (variant === 'invitationCard') return null;
  if (variant === 'invitationList') return { width: 52, height: 52 };
  return { width: 76, height: 76 };
}

function SkywriteMediaPreviewComponent({
  skywrite,
  variant,
  previewIdPrefix = 'sw-preview',
  excerpt,
  onToggleAudio,
  isAudioPlaying,
  allowAudioPreview = true,
  style,
}: SkywriteMediaPreviewProps) {
  const media = useMemo(() => pickSkywriteMediaSource(skywrite), [skywrite]);
  const [imageFailed, setImageFailed] = useState(false);
  const previewId = `${previewIdPrefix}-${skywrite.id}`;
  const playing = isAudioPlaying?.(previewId) ?? false;
  const textExcerpt = excerpt ?? skywritePreviewExcerpt(skywrite.text, variant === 'invitationList' ? 80 : 140);

  if (media.kind === 'text') {
    if (!textExcerpt) return null;
    return (
      <Text
        style={[styles.textOnly, variant === 'invitationCard' && styles.textOnlyCard]}
        numberOfLines={variant === 'invitationList' ? 2 : 3}>
        {textExcerpt}
      </Text>
    );
  }

  const showPhoto =
    (media.kind === 'photo' || media.kind === 'photo_audio') && media.photoUri && !imageFailed;
  const showAudio = (media.kind === 'audio' || media.kind === 'photo_audio') && media.audioUri;
  const thumb = thumbnailSize(variant);
  const listLayout = variant === 'library' || variant === 'invitationList';

  return (
    <View style={[listLayout ? styles.rowLayout : styles.stackLayout, style]}>
      {showPhoto ? (
        <View
          style={[
            styles.thumbWrap,
            variant === 'invitationCard' && styles.thumbWrapCard,
            thumb ? { width: thumb.width, height: thumb.height } : null,
          ]}>
          <Image
            source={{ uri: media.photoUri! }}
            style={styles.thumbImage}
            contentFit="cover"
            transition={120}
            onError={() => setImageFailed(true)}
            accessibilityIgnoresInvertColors
          />
          {media.kind === 'photo_audio' && media.audioUri ? (
            <View style={styles.audioBadge}>
              <Text style={styles.audioBadgeIcon}>♪</Text>
              <Text style={styles.audioBadgeDuration}>
                {formatSkywriteAudioDuration(media.audioDurationMs)}
              </Text>
            </View>
          ) : null}
        </View>
      ) : media.kind === 'photo' || media.kind === 'photo_audio' ? (
        <View
          style={[
            styles.fallbackThumb,
            variant === 'invitationCard' ? styles.thumbWrapCard : null,
            thumb ? { width: thumb.width, height: thumb.height } : null,
          ]}>
          <Text style={styles.fallbackIcon}>◻</Text>
        </View>
      ) : null}

      <View style={styles.textColumn}>
        {textExcerpt && media.kind !== 'audio' ? (
          <Text style={styles.excerpt} numberOfLines={variant === 'invitationList' ? 2 : 2}>
            {textExcerpt}
          </Text>
        ) : null}

        {showAudio ? (
          allowAudioPreview ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={playing ? 'Pause audio preview' : 'Play audio preview'}
              onPress={(event) => {
                event.stopPropagation();
                onToggleAudio?.(previewId, media.audioUri!);
              }}
              style={({ pressed }) => [styles.audioStrip, pressed && styles.pressed]}>
              <View style={styles.playBtn}>
                <Text style={styles.playBtnText}>{playing ? '❚❚' : '▶'}</Text>
              </View>
              <SkywriteAudioWaveform active={playing} seed={skywrite.id.length} barCount={12} />
              <Text style={styles.duration}>
                {formatSkywriteAudioDuration(media.audioDurationMs)}
              </Text>
            </Pressable>
          ) : (
            <View style={styles.audioStrip}>
              <View style={styles.playBtn}>
                <Text style={styles.playBtnText}>♪</Text>
              </View>
              <SkywriteAudioWaveform active={false} seed={skywrite.id.length} barCount={12} />
              <Text style={styles.duration}>
                {formatSkywriteAudioDuration(media.audioDurationMs)}
              </Text>
            </View>
          )
        ) : null}

        {media.kind === 'audio' && !textExcerpt ? (
          <Text style={styles.audioOnlyHint} numberOfLines={1}>
            Voice Skywrite
          </Text>
        ) : null}
      </View>
    </View>
  );
}

export const SkywriteMediaPreview = memo(SkywriteMediaPreviewComponent);

export function skywriteHasMediaPreview(record: Pick<SkywriteRecord, 'media' | 'mediaMode'>): boolean {
  return pickSkywriteMediaSource(record).kind !== 'text';
}

const styles = StyleSheet.create({
  rowLayout: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
  },
  stackLayout: {
    gap: 8,
  },
  textColumn: {
    flex: 1,
    minWidth: 0,
    gap: 6,
  },
  thumbWrap: {
    borderRadius: Radius.md,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(232, 200, 114, 0.28)',
    backgroundColor: 'rgba(8, 10, 24, 0.5)',
  },
  thumbWrapCard: {
    width: '100%',
    height: 132,
    alignSelf: 'stretch',
  },
  thumbImage: {
    width: '100%',
    height: '100%',
  },
  fallbackThumb: {
    borderRadius: Radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(167, 139, 250, 0.25)',
    backgroundColor: 'rgba(12, 10, 28, 0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fallbackIcon: {
    fontSize: 18,
    color: 'rgba(235,228,248,0.45)',
  },
  audioBadge: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radius.full,
    backgroundColor: 'rgba(8, 10, 24, 0.78)',
    borderWidth: 1,
    borderColor: 'rgba(232, 200, 114, 0.35)',
  },
  audioBadgeIcon: {
    fontSize: 10,
    color: '#E8C872',
  },
  audioBadgeDuration: {
    fontFamily: Fonts.sans,
    fontSize: 10,
    fontWeight: '600',
    color: '#F5F0FF',
  },
  excerpt: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    lineHeight: 18,
    color: 'rgba(235,228,248,0.88)',
  },
  textOnly: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    lineHeight: 18,
    color: 'rgba(235,228,248,0.88)',
  },
  textOnlyCard: {
    fontSize: 14,
    lineHeight: 20,
    color: '#F5F0FF',
  },
  audioStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: Radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(167, 139, 250, 0.28)',
    backgroundColor: 'rgba(12, 10, 28, 0.45)',
    paddingHorizontal: 8,
    paddingVertical: 8,
    minHeight: 44,
  },
  playBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(232, 200, 114, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(232, 200, 114, 0.12)',
  },
  playBtnText: {
    fontFamily: Fonts.sans,
    fontSize: 11,
    fontWeight: '700',
    color: '#E8C872',
  },
  duration: {
    fontFamily: Fonts.sans,
    fontSize: 10,
    fontWeight: '600',
    color: 'rgba(235,228,248,0.62)',
    minWidth: 32,
    textAlign: 'right',
  },
  audioOnlyHint: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    color: 'rgba(235,228,248,0.65)',
  },
  pressed: { opacity: 0.88 },
});
