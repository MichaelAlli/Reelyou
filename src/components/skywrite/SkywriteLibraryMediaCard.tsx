import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { memo, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { SkywriteAudioWaveform } from '@/components/skywrite/SkywriteAudioWaveform';
import { Fonts, Radius } from '@/constants/theme';
import {
  formatSkywriteAudioDuration,
  pickSkywriteMediaSource,
  skywritePreviewExcerpt,
} from '@/skywrite/media/skywriteMediaPreviewUtils';
import { parseRemoteAssetIdFromUri } from '@/social/sharedMediaConstants';
import { useResolvedSkywriteLibraryPreview } from '@/social/useResolvedSkywriteLibraryPreview';
import type { SkywriteRecord } from '@/skywrite/types';

export interface SkywriteLibraryMenuAction {
  id: string;
  label: string;
  onPress: () => void;
}

interface SkywriteLibraryMediaCardProps {
  skywrite: Pick<SkywriteRecord, 'id' | 'text' | 'media' | 'mediaMode'>;
  caption?: string;
  dateLabel?: string;
  menuActions?: SkywriteLibraryMenuAction[];
  onPressMedia: () => void;
  onToggleAudio?: (previewId: string, uri: string) => void;
  isAudioPlaying?: (previewId: string) => boolean;
  style?: StyleProp<ViewStyle>;
  compactGrid?: boolean;
}

function SkywriteLibraryMediaCardComponent({
  skywrite,
  caption,
  dateLabel,
  menuActions = [],
  onPressMedia,
  onToggleAudio,
  isAudioPlaying,
  style,
  compactGrid = false,
}: SkywriteLibraryMediaCardProps) {
  const { record: resolvedSkywrite, status, previewError, retry } = useResolvedSkywriteLibraryPreview(
    skywrite as SkywriteRecord,
  );
  const viewRecord = resolvedSkywrite ?? (skywrite as SkywriteRecord);
  const media = useMemo(() => pickSkywriteMediaSource(viewRecord), [viewRecord]);
  const [imageFailed, setImageFailed] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const previewId = `library-card-${skywrite.id}`;
  const playing = isAudioPlaying?.(previewId) ?? false;
  const captionText =
    caption ??
    (skywritePreviewExcerpt(skywrite.text, 100) ||
      (media.kind === 'audio' ? 'Voice Skywrite' : ''));

  const imageUri =
    media.kind === 'video' || media.kind === 'video_audio'
      ? media.videoThumbnailUri
      : media.kind === 'photo' || media.kind === 'photo_audio'
        ? media.photoUri
        : null;

  useEffect(() => {
    setImageFailed(false);
  }, [skywrite.id, imageUri]);

  const thumbnailResolving =
    Boolean(imageUri && parseRemoteAssetIdFromUri(imageUri) && status === 'loading' && !imageFailed);

  const showPlayOverlay =
    media.kind === 'video' ||
    media.kind === 'video_audio' ||
    (media.kind === 'audio' && !onToggleAudio);

  const thumbnailFit =
    media.kind === 'video' || media.kind === 'video_audio' ? 'contain' : 'cover';

  return (
    <View style={[styles.card, style]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Open Skywrite media"
        onPress={onPressMedia}
        style={({ pressed }) => [
          styles.mediaBox,
          compactGrid && styles.mediaBoxGrid,
          pressed && styles.pressed,
        ]}>
        {media.kind === 'text' ? (
          <LinearGradient
            colors={['rgba(88, 56, 168, 0.65)', 'rgba(12, 10, 32, 0.94)']}
            style={styles.mediaFill}>
            <Text style={styles.textBody} numberOfLines={8}>
              {captionText || 'Skywrite'}
            </Text>
          </LinearGradient>
        ) : media.kind === 'audio' && media.audioUri && onToggleAudio ? (
          <LinearGradient
            colors={['rgba(32, 24, 64, 0.85)', 'rgba(8, 10, 28, 0.95)']}
            style={[styles.mediaFill, styles.audioBox]}>
            <Pressable
              onPress={(event) => {
                event.stopPropagation();
                onToggleAudio(previewId, media.audioUri!);
              }}
              style={styles.audioPlay}>
              <Text style={styles.playIcon}>{playing ? '❚❚' : '▶'}</Text>
            </Pressable>
            <SkywriteAudioWaveform active={playing} seed={skywrite.id.length} barCount={16} />
            <Text style={styles.audioDuration}>
              {formatSkywriteAudioDuration(media.audioDurationMs)}
            </Text>
          </LinearGradient>
        ) : thumbnailResolving ? (
          <View style={[styles.mediaFill, styles.fallback]}>
            <ActivityIndicator color="#E8C872" />
          </View>
        ) : imageUri && !imageFailed ? (
          <>
            <Image
              source={{ uri: imageUri }}
              style={styles.mediaImage}
              contentFit={thumbnailFit}
              transition={120}
              onError={() => {
            setImageFailed(true);
            if (previewError || status === 'error') retry();
          }}
              accessibilityIgnoresInvertColors
            />
            {showPlayOverlay ? (
              <View style={styles.playOverlay}>
                <Text style={styles.playIconLarge}>▶</Text>
              </View>
            ) : null}
            {media.kind === 'photo_audio' || media.kind === 'video_audio' ? (
              <View style={styles.voiceBadge}>
                <Text style={styles.voiceBadgeText}>♪ Voiceover</Text>
              </View>
            ) : null}
          </>
        ) : media.kind === 'photo_audio' || media.kind === 'photo' ? (
          <LinearGradient
            colors={['rgba(88, 56, 168, 0.55)', 'rgba(12, 10, 32, 0.92)']}
            style={styles.mediaFill}>
            <Text style={styles.textBody} numberOfLines={6}>
              {captionText || 'Photo Skywrite'}
            </Text>
            {media.kind === 'photo_audio' ? (
              <View style={styles.voiceBadgeInline}>
                <Text style={styles.voiceBadgeText}>♪ Voiceover</Text>
              </View>
            ) : null}
          </LinearGradient>
        ) : (
          <View style={[styles.mediaFill, styles.fallback]}>
            <Text style={styles.playIconLarge}>{media.kind.includes('video') ? '▶' : '◻'}</Text>
            {captionText ? (
              <Text style={styles.fallbackCaption} numberOfLines={3}>
                {captionText}
              </Text>
            ) : null}
          </View>
        )}
      </Pressable>

      <View style={styles.metaRow}>
        <View style={styles.metaText}>
          {captionText ? (
            <Text style={styles.caption} numberOfLines={2}>
              {captionText}
            </Text>
          ) : null}
          {dateLabel ? <Text style={styles.date}>{dateLabel}</Text> : null}
        </View>
        {menuActions.length > 0 ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="More actions"
            hitSlop={8}
            onPress={() => setMenuOpen(true)}
            style={styles.menuBtn}>
            <Text style={styles.menuIcon}>⋯</Text>
          </Pressable>
        ) : null}
      </View>

      <Modal visible={menuOpen} transparent animationType="fade" onRequestClose={() => setMenuOpen(false)}>
        <Pressable style={styles.menuBackdrop} onPress={() => setMenuOpen(false)}>
          <View style={styles.menuSheet}>
            {menuActions.map((action) => (
              <Pressable
                key={action.id}
                onPress={() => {
                  setMenuOpen(false);
                  action.onPress();
                }}
                style={styles.menuItem}>
                <Text style={styles.menuItemText}>{action.label}</Text>
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

export const SkywriteLibraryMediaCard = memo(SkywriteLibraryMediaCardComponent);

const styles = StyleSheet.create({
  card: { gap: 8 },
  mediaBox: {
    width: '100%',
    aspectRatio: 4 / 5,
    maxHeight: 320,
    borderRadius: Radius.lg,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(232, 200, 114, 0.28)',
    backgroundColor: 'rgba(8, 10, 24, 0.55)',
  },
  mediaBoxGrid: {
    aspectRatio: 3 / 4,
    maxHeight: 200,
  },
  mediaFill: { flex: 1, width: '100%', height: '100%' },
  mediaImage: { width: '100%', height: '100%' },
  textBody: {
    flex: 1,
    padding: 16,
    fontFamily: Fonts.serif,
    fontSize: 18,
    lineHeight: 26,
    color: '#FFF8F0',
    textAlign: 'left',
  },
  audioBox: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: 16,
  },
  audioPlay: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(232, 200, 114, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(232, 200, 114, 0.14)',
  },
  playIcon: { fontSize: 18, color: '#E8C872', fontWeight: '700' },
  playIconLarge: { fontSize: 34, color: '#E8C872', fontWeight: '700' },
  playOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(4, 6, 16, 0.22)',
  },
  voiceBadge: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.full,
    backgroundColor: 'rgba(8, 10, 24, 0.78)',
    borderWidth: 1,
    borderColor: 'rgba(232, 200, 114, 0.35)',
  },
  voiceBadgeText: {
    fontFamily: Fonts.sans,
    fontSize: 10,
    fontWeight: '600',
    color: '#F5F0FF',
  },
  fallback: { alignItems: 'center', justifyContent: 'center', paddingHorizontal: 12 },
  fallbackCaption: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    lineHeight: 16,
    color: 'rgba(235,228,248,0.72)',
    textAlign: 'center',
    marginTop: 8,
  },
  voiceBadgeInline: {
    marginTop: 10,
    alignSelf: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.full,
    backgroundColor: 'rgba(8, 10, 24, 0.78)',
    borderWidth: 1,
    borderColor: 'rgba(232, 200, 114, 0.35)',
  },
  metaRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  metaText: { flex: 1, gap: 2 },
  caption: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    lineHeight: 18,
    color: 'rgba(235,228,248,0.9)',
  },
  date: {
    fontFamily: Fonts.sans,
    fontSize: 11,
    color: 'rgba(235,228,248,0.52)',
  },
  menuBtn: {
    minWidth: 36,
    minHeight: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuIcon: {
    fontSize: 22,
    color: 'rgba(232, 200, 114, 0.85)',
    lineHeight: 22,
  },
  menuBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  menuSheet: {
    margin: 16,
    borderRadius: 16,
    backgroundColor: 'rgba(8, 10, 28, 0.98)',
    borderWidth: 1,
    borderColor: 'rgba(232, 200, 114, 0.22)',
    paddingVertical: 8,
  },
  menuItem: { paddingHorizontal: 16, paddingVertical: 14, minHeight: 44 },
  menuItemText: {
    fontFamily: Fonts.sans,
    fontSize: 15,
    color: '#FFF8F0',
  },
  pressed: { opacity: 0.92 },
  audioDuration: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    color: 'rgba(248,244,236,0.65)',
  },
});
