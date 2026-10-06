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
import { getSkywritePreview } from '@/skywrite/media/getSkywritePreview';
import {
  formatSkywriteAudioDuration,
  pickSkywriteMediaSource,
  skywritePreviewExcerpt,
} from '@/skywrite/media/skywriteMediaPreviewUtils';
import {
  getSkywriteAudioSource,
  getSkywritePlayableAudioUri,
  logMissingSkywriteAudioInDev,
  logUnrecoverableSkywriteAudioInDev,
} from '@/skywrite/media/getSkywriteAudioSource';
import {
  getSkywriteThumbnail,
  skywriteHasVideoMedia,
} from '@/skywrite/media/getSkywriteThumbnail';
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
  getAudioPreviewProgress?: (previewId: string) => {
    positionMs: number;
    durationMs: number;
    isPlaying: boolean;
  };
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
  getAudioPreviewProgress,
  style,
  compactGrid = false,
}: SkywriteLibraryMediaCardProps) {
  const { record: resolvedSkywrite, status, previewError, retry } = useResolvedSkywriteLibraryPreview(
    skywrite as SkywriteRecord,
  );
  const viewRecord = resolvedSkywrite ?? (skywrite as SkywriteRecord);
  const previewId = `library-card-${skywrite.id}`;
  const media = useMemo(() => pickSkywriteMediaSource(viewRecord), [viewRecord]);
  const preview = useMemo(() => getSkywritePreview(viewRecord), [viewRecord]);
  const audioSource = useMemo(() => getSkywriteAudioSource(viewRecord), [viewRecord]);
  const previewProgress = getAudioPreviewProgress?.(previewId);
  const audioDurationMs =
    previewProgress && previewProgress.durationMs > 0
      ? previewProgress.durationMs
      : audioSource.durationMs;
  const audioPlayUri = getSkywritePlayableAudioUri(viewRecord) ?? audioSource.uri;

  useEffect(() => {
    if (media.kind !== 'audio') return;
    logMissingSkywriteAudioInDev(viewRecord, 'library-card');
    logUnrecoverableSkywriteAudioInDev(viewRecord, 'library-card');
  }, [media.kind, viewRecord]);

  const [imageFailed, setImageFailed] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const playing = isAudioPlaying?.(previewId) ?? false;
  const captionText =
    caption ??
    (skywritePreviewExcerpt(skywrite.text, 100) ||
      (media.kind === 'audio' ? 'Voice Skywrite' : ''));

  const imageUri = preview.imageUri ?? getSkywriteThumbnail(viewRecord);
  const isVideoTile = preview.isVideo;

  useEffect(() => {
    setImageFailed(false);
  }, [skywrite.id, imageUri]);

  const remotePhotoPending =
    preview.isPhoto &&
    Boolean(
      parseRemoteAssetIdFromUri(viewRecord.media.photo?.uri) ||
        viewRecord.media.photo?.remoteAssetId,
    );

  const visualLoading =
    !imageFailed &&
    (preview.isPhoto || preview.isVideo) &&
    (!imageUri ||
      ((Boolean(parseRemoteAssetIdFromUri(imageUri)) || remotePhotoPending) && status === 'loading'));

  const showVideoBadge = isVideoTile && Boolean(imageUri) && !imageFailed;

  const thumbnailFit = 'cover';

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
        {preview.isText ? (
          <LinearGradient
            colors={['rgba(88, 56, 168, 0.65)', 'rgba(12, 10, 32, 0.94)']}
            style={styles.mediaFill}>
            <Text style={styles.textBody} numberOfLines={8}>
              {captionText || 'Skywrite'}
            </Text>
          </LinearGradient>
        ) : media.kind === 'audio' && onToggleAudio ? (
          <LinearGradient
            colors={['rgba(32, 24, 64, 0.85)', 'rgba(8, 10, 28, 0.95)']}
            style={[styles.mediaFill, styles.audioBox]}>
            {status === 'loading' && !audioPlayUri ? (
              <ActivityIndicator color="#E8C872" size="small" />
            ) : (
              <>
                <Pressable
                  disabled={!audioPlayUri}
                  onPress={(event) => {
                    event.stopPropagation();
                    if (!audioPlayUri) return;
                    onToggleAudio(previewId, audioPlayUri);
                  }}
                  style={styles.audioPlay}>
                  <Text style={styles.playIcon}>{playing ? '❚❚' : '▶'}</Text>
                </Pressable>
                <SkywriteAudioWaveform active={playing} seed={skywrite.id.length} barCount={16} />
                <Text style={styles.audioDuration}>
                  {status === 'loading' && !audioDurationMs
                    ? '…'
                    : formatSkywriteAudioDuration(audioDurationMs)}
                </Text>
              </>
            )}
          </LinearGradient>
        ) : visualLoading ? (
          <View style={[styles.mediaFill, styles.thumbSkeleton]}>
            <ActivityIndicator color="#E8C872" size="small" />
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
            {showVideoBadge ? (
              <View style={styles.videoBadge}>
                <Text style={styles.videoBadgeIcon}>▶</Text>
              </View>
            ) : null}
            {media.kind === 'photo_audio' || media.kind === 'video_audio' ? (
              <View style={styles.voiceBadge}>
                <Text style={styles.voiceBadgeText}>♪ Voiceover</Text>
              </View>
            ) : null}
          </>
        ) : preview.isPhoto || preview.isVideo ? (
          <View style={[styles.mediaFill, styles.thumbSkeleton]}>
            <ActivityIndicator color="#E8C872" size="small" />
          </View>
        ) : (
          <View style={[styles.mediaFill, styles.fallback]}>
            <Text style={styles.playIconLarge}>◻</Text>
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
  thumbSkeleton: {
    backgroundColor: 'rgba(12, 14, 28, 0.88)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  videoBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 26,
    height: 26,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  videoBadgeIcon: {
    fontSize: 11,
    color: '#FFFFFF',
    fontWeight: '700',
    marginLeft: 2,
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
