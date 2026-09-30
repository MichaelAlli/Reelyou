import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { memo, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { SkywriteAudioWaveform } from '@/components/skywrite/SkywriteAudioWaveform';
import { Fonts, Radius } from '@/constants/theme';
import {
  formatSkywriteAudioDuration,
  pickSkywriteMediaSource,
  skywritePreviewExcerpt,
} from '@/skywrite/media/skywriteMediaPreviewUtils';
import { useResolvedSkywriteRecord } from '@/social/useResolvedSkywriteRecord';
import type { SkywriteRecord } from '@/skywrite/types';

export type SkywriteMediaPreviewVariant = 'library' | 'invitationCard' | 'invitationList';

interface SkywriteMediaPreviewProps {
  skywrite: Pick<SkywriteRecord, 'id' | 'text' | 'media' | 'mediaMode'>;
  variant: SkywriteMediaPreviewVariant;
  previewIdPrefix?: string;
  excerpt?: string;
  onToggleAudio?: (previewId: string, uri: string) => void;
  isAudioPlaying?: (previewId: string) => boolean;
  allowAudioPreview?: boolean;
  style?: StyleProp<ViewStyle>;
}

function squareSize(variant: SkywriteMediaPreviewVariant): number {
  if (variant === 'invitationList') return 52;
  if (variant === 'library') return 76;
  return 76;
}

function SkywriteSquareTile({
  skywrite,
  variant,
  excerpt,
}: {
  skywrite: Pick<SkywriteRecord, 'id' | 'text' | 'media' | 'mediaMode'>;
  variant: SkywriteMediaPreviewVariant;
  excerpt: string;
}) {
  const { record: resolved, retry } = useResolvedSkywriteRecord(skywrite as SkywriteRecord);
  const viewSkywrite = resolved ?? (skywrite as SkywriteRecord);
  const media = useMemo(() => pickSkywriteMediaSource(viewSkywrite), [viewSkywrite]);
  const [imageFailed, setImageFailed] = useState(false);
  const size = squareSize(variant);

  if (media.kind === 'text') {
    const tileText = excerpt || media.textExcerpt || 'Skywrite';
    return (
      <LinearGradient
        colors={['rgba(88, 56, 168, 0.55)', 'rgba(12, 10, 32, 0.92)']}
        style={[styles.squareTile, { width: size, height: size }]}>
        <Text style={styles.squareText} numberOfLines={variant === 'invitationList' ? 3 : 4}>
          {tileText}
        </Text>
      </LinearGradient>
    );
  }

  const imageUri =
    media.kind === 'video' || media.kind === 'video_audio'
      ? media.videoThumbnailUri
      : media.photoUri;

  const showImage = Boolean(imageUri) && !imageFailed;
  const showPlay =
    media.kind === 'video' || media.kind === 'video_audio' || media.kind === 'audio';

  return (
    <View style={[styles.squareTile, styles.squareMedia, { width: size, height: size }]}>
      {showImage ? (
        <Image
          source={{ uri: imageUri! }}
          style={styles.squareImage}
          contentFit="cover"
          transition={120}
          onError={() => {
            setImageFailed(true);
            retry();
          }}
          accessibilityIgnoresInvertColors
        />
      ) : (
        <View style={styles.squareFallback}>
          <Text style={styles.fallbackIcon}>{media.kind.includes('video') ? '▶' : '◻'}</Text>
        </View>
      )}
      {showPlay ? (
        <View style={styles.playBadge}>
          <Text style={styles.playBadgeIcon}>▶</Text>
        </View>
      ) : null}
      {media.kind === 'photo_audio' || media.kind === 'video_audio' ? (
        <View style={styles.audioBadge}>
          <Text style={styles.audioBadgeIcon}>♪</Text>
        </View>
      ) : null}
    </View>
  );
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
  const { record: resolved, retry } = useResolvedSkywriteRecord(skywrite as SkywriteRecord);
  const viewSkywrite = resolved ?? (skywrite as SkywriteRecord);
  const media = useMemo(() => pickSkywriteMediaSource(viewSkywrite), [viewSkywrite]);
  const previewId = `${previewIdPrefix}-${skywrite.id}`;
  const playing = isAudioPlaying?.(previewId) ?? false;
  const textExcerpt = excerpt ?? skywritePreviewExcerpt(skywrite.text, variant === 'invitationList' ? 80 : 140);
  const listLayout = variant === 'library' || variant === 'invitationList';
  const useSquareTile = variant === 'library' || variant === 'invitationList';

  if (variant === 'invitationCard') {
    if (media.kind === 'text') {
      if (!textExcerpt) return null;
      return (
        <Text style={styles.textOnlyCard} numberOfLines={3}>
          {textExcerpt}
        </Text>
      );
    }
    return (
      <View style={[styles.stackLayout, style]}>
        <SkywriteSquareTile skywrite={skywrite} variant={variant} excerpt={textExcerpt} />
        {textExcerpt ? (
          <Text style={styles.excerpt} numberOfLines={2}>
            {textExcerpt}
          </Text>
        ) : null}
      </View>
    );
  }

  if (useSquareTile) {
    return (
      <View style={[listLayout ? styles.rowLayout : styles.stackLayout, style]}>
        <SkywriteSquareTile skywrite={skywrite} variant={variant} excerpt={textExcerpt} />
        <View style={styles.textColumn}>
          {textExcerpt && media.kind !== 'audio' ? (
            <Text style={styles.excerpt} numberOfLines={variant === 'invitationList' ? 2 : 2}>
              {textExcerpt}
            </Text>
          ) : null}
          {media.kind === 'audio' && media.audioUri ? (
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

  return null;
}

export const SkywriteMediaPreview = memo(SkywriteMediaPreviewComponent);

export function skywriteHasMediaPreview(record: Pick<SkywriteRecord, 'media' | 'mediaMode' | 'text'>): boolean {
  return true;
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
  squareTile: {
    borderRadius: Radius.md,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(232, 200, 114, 0.28)',
  },
  squareMedia: {
    backgroundColor: 'rgba(8, 10, 24, 0.5)',
  },
  squareImage: {
    width: '100%',
    height: '100%',
  },
  squareFallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(12, 10, 28, 0.55)',
  },
  squareText: {
    flex: 1,
    padding: 8,
    fontFamily: Fonts.sans,
    fontSize: 11,
    lineHeight: 15,
    color: 'rgba(248,244,236,0.92)',
    textAlign: 'left',
  },
  fallbackIcon: {
    fontSize: 18,
    color: 'rgba(235,228,248,0.45)',
  },
  playBadge: {
    position: 'absolute',
    inset: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(4, 6, 16, 0.28)',
  },
  playBadgeIcon: {
    fontSize: 22,
    color: '#E8C872',
    fontWeight: '700',
  },
  audioBadge: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(8, 10, 24, 0.78)',
    borderWidth: 1,
    borderColor: 'rgba(232, 200, 114, 0.35)',
  },
  audioBadgeIcon: {
    fontSize: 10,
    color: '#E8C872',
  },
  excerpt: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    lineHeight: 18,
    color: 'rgba(235,228,248,0.88)',
  },
  textOnlyCard: {
    fontFamily: Fonts.sans,
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
