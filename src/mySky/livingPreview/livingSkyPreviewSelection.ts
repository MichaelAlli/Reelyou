import { canViewSkywrite } from '@/skywrite/access/canViewSkywrite';
import { isEphemeralMediaUri } from '@/social/sharedMediaConstants';
import {
  isSkywriteInRecentLibrary,
  isSkywriteInYourJourney,
  parsePublishedAtMs,
} from '@/skywrite/library/skywriteLibraryRetention';
import { resolveSkywriteStarMeaning } from '@/mySky/getSkywriteStarColor';
import type { SkywriteRecord } from '@/skywrite/types';
import { isStandaloneAudioRecord } from '@/skywrite/voiceoverStepUtils';

import { LIVING_SKY_FEATURED_MAX } from './livingSkyFeaturedLogic';
import type {
  LivingSkyPreviewMoment,
  LivingSkyPreviewPresentation,
  LivingSkyPreviewSelection,
  LivingSkyPreviewSelectionInput,
  LivingSkyPreviewStarRef,
} from './livingSkyPreviewTypes';

/** Matches Play Sky's 24-hour window. Used only to reject expired SkyReel-only media. */
const SKYREEL_WINDOW_MS = 24 * 60 * 60 * 1000;

interface EligibleMoment extends LivingSkyPreviewMoment {
  createdAtMs: number;
  inJourney: boolean;
  meaning: 'motion' | 'memory' | 'reflection';
}

function httpUri(uri: string | undefined | null): string | null {
  if (!uri) return null;
  if (uri.startsWith('https://') || uri.startsWith('http://')) return uri;
  return null;
}

function ownerLocalUri(uri: string | undefined | null, viewerIsOwner: boolean): string | null {
  if (!uri || !viewerIsOwner) return null;
  if (uri.startsWith('reelyou-asset://')) return null;
  return uri;
}

function displayableImageUri(
  uri: string | undefined | null,
  viewerIsOwner: boolean,
): string | null {
  return httpUri(uri) ?? ownerLocalUri(uri, viewerIsOwner);
}

function hasDurableVisual(post: SkywriteRecord): boolean {
  return Boolean(httpUri(post.media.photo?.uri) || httpUri(post.media.video?.thumbnailUri));
}

function isExpiredSkyreelOnly(post: SkywriteRecord, nowMs: number): boolean {
  if (isSkywriteInYourJourney(post)) return false;
  if (isSkywriteInRecentLibrary(post, nowMs)) return false;
  if (hasDurableVisual(post)) return false;
  if (
    (post.mediaMode === 'text' || post.mediaMode === 'text_voiceover') &&
    post.text.trim().length > 0
  ) {
    return false;
  }
  const until =
    typeof post.skyreelActiveUntilMs === 'number' && Number.isFinite(post.skyreelActiveUntilMs)
      ? post.skyreelActiveUntilMs
      : parsePublishedAtMs(post) + SKYREEL_WINDOW_MS;
  return nowMs >= until;
}

function postBelongsToSky(post: SkywriteRecord, skyOwnerId: string, viewerIsOwner: boolean): boolean {
  if (post.authorId) return post.authorId === skyOwnerId;
  return viewerIsOwner;
}

function presentationFor(
  post: SkywriteRecord,
  viewerIsOwner: boolean,
): { presentation: LivingSkyPreviewPresentation; imageUri: string | null } | null {
  if (post.mediaMode === 'voice' || isStandaloneAudioRecord(post)) return null;

  const photoUri = displayableImageUri(post.media.photo?.uri, viewerIsOwner);
  const videoUri = post.media.video?.uri || post.media.video?.remoteAssetId;
  const thumbUri = displayableImageUri(post.media.video?.thumbnailUri, viewerIsOwner);
  const meaning = resolveSkywriteStarMeaning(post);

  if (meaning === 'motion' || post.mediaMode === 'video' || post.mediaMode === 'video_voiceover') {
    if (!videoUri && !thumbUri) return null;
    if (thumbUri) return { presentation: 'video', imageUri: thumbUri };
    if (videoUri && isEphemeralMediaUri(post.media.video?.uri) && !viewerIsOwner) return null;
    return { presentation: 'video-fallback', imageUri: null };
  }

  if (meaning === 'memory' || post.mediaMode === 'photo' || post.mediaMode === 'photo_voiceover') {
    if (!photoUri) return null;
    return { presentation: 'photo', imageUri: photoUri };
  }

  if (!post.text.trim()) return null;
  return { presentation: 'text', imageUri: null };
}

function stableTie(id: string): number {
  let hash = 2166136261;
  for (let index = 0; index < id.length; index += 1) {
    hash ^= id.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function compareRecent(a: EligibleMoment, b: EligibleMoment): number {
  if (b.createdAtMs !== a.createdAtMs) return b.createdAtMs - a.createdAtMs;
  if (a.inJourney !== b.inJourney) return a.inJourney ? -1 : 1;
  return stableTie(a.postId) - stableTie(b.postId);
}

function labelFor(post: SkywriteRecord, presentation: LivingSkyPreviewPresentation): string {
  const text = post.text.trim();
  const kind =
    presentation === 'photo'
      ? 'Photo Skywrite'
      : presentation === 'text'
        ? 'Text Skywrite'
        : 'Video Skywrite';
  return text ? `${kind}: ${text}` : kind;
}

function toMoment(
  star: LivingSkyPreviewStarRef,
  post: SkywriteRecord,
  viewerIsOwner: boolean,
): EligibleMoment | null {
  const visual = presentationFor(post, viewerIsOwner);
  if (!visual) return null;
  return {
    postId: post.id,
    starId: star.id,
    starX: star.x,
    starY: star.y,
    starColor: star.color,
    presentation: visual.presentation,
    imageUri: visual.imageUri,
    text: post.text.trim(),
    label: labelFor(post, visual.presentation),
    createdAtMs: parsePublishedAtMs(post),
    inJourney: isSkywriteInYourJourney(post),
    meaning: resolveSkywriteStarMeaning(post),
  };
}

function selectAutomatic(eligible: readonly EligibleMoment[]): EligibleMoment[] {
  const sorted = [...eligible].sort(compareRecent);
  const picked: EligibleMoment[] = [];
  const meanings = new Set<EligibleMoment['meaning']>();
  const first = sorted[0];
  if (!first) return picked;
  picked.push(first);
  meanings.add(first.meaning);

  while (picked.length < LIVING_SKY_FEATURED_MAX) {
    const remaining = sorted.filter((entry) => !picked.some((item) => item.postId === entry.postId));
    if (remaining.length === 0) break;
    const varied = remaining.find((entry) => !meanings.has(entry.meaning));
    const next = varied ?? remaining[0];
    if (!next) break;
    picked.push(next);
    meanings.add(next.meaning);
  }
  return picked;
}

/** Persistent Skywrite moments for the living preview. Does not create stars or posts. */
export function selectLivingSkyFeaturedMoments(
  input: LivingSkyPreviewSelectionInput,
): LivingSkyPreviewSelection {
  const nowMs = input.nowMs ?? Date.now();
  const postsById = new Map<string, SkywriteRecord>();
  for (const post of input.posts) {
    if (!postsById.has(post.id)) postsById.set(post.id, post);
  }

  const eligible: EligibleMoment[] = [];
  const seenPosts = new Set<string>();

  for (const star of input.stars) {
    if (star.type !== 'skywrite' || !star.sourceId) continue;
    if (seenPosts.has(star.sourceId)) continue;
    if (input.unavailableIds?.has(star.sourceId)) continue;
    const post = postsById.get(star.sourceId);
    if (!post) continue;
    if (!postBelongsToSky(post, input.skyOwnerId, input.viewerIsOwner)) continue;
    if (isExpiredSkyreelOnly(post, nowMs)) continue;
    const authorId = post.authorId ?? (input.viewerIsOwner ? input.skyOwnerId : '');
    if (
      !authorId ||
      !canViewSkywrite({
        viewerId: input.access.viewerId,
        authorId,
        visibility: post.visibility,
        viewerFollowsAuthor: input.access.viewerFollowsAuthor,
        authorFollowsViewer: input.access.authorFollowsViewer,
        viewerBlockedAuthor: input.access.viewerBlockedAuthor,
        authorBlockedViewer: input.access.authorBlockedViewer,
      })
    ) {
      continue;
    }
    const moment = toMoment(star, post, input.viewerIsOwner);
    if (!moment) continue;
    seenPosts.add(post.id);
    eligible.push(moment);
  }

  if (input.manualIds && input.manualIds.length > 0) {
    const byPost = new Map(eligible.map((entry) => [entry.postId, entry]));
    const manual: EligibleMoment[] = [];
    const seen = new Set<string>();
    for (const id of input.manualIds) {
      if (typeof id !== 'string') continue;
      const trimmed = id.trim();
      if (!trimmed || seen.has(trimmed)) continue;
      seen.add(trimmed);
      const moment = byPost.get(trimmed);
      if (!moment) continue;
      manual.push(moment);
      if (manual.length >= LIVING_SKY_FEATURED_MAX) break;
    }
    if (manual.length > 0) {
      return { mode: 'manual', moments: manual.map(stripScore) };
    }
  }

  return { mode: 'automatic', moments: selectAutomatic(eligible).map(stripScore) };
}

function stripScore(moment: EligibleMoment): LivingSkyPreviewMoment {
  return {
    postId: moment.postId,
    starId: moment.starId,
    starX: moment.starX,
    starY: moment.starY,
    starColor: moment.starColor,
    presentation: moment.presentation,
    imageUri: moment.imageUri,
    text: moment.text,
    label: moment.label,
  };
}

/** Preview taps open the persistent Skywrite viewer, never SkyReel playback. */
export function resolveLivingSkyPreviewTarget(postId: string): {
  kind: 'skywrite-detail';
  skywriteId: string;
} {
  return { kind: 'skywrite-detail', skywriteId: postId };
}
