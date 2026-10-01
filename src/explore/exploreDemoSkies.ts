import type { SkyOwnerProfile } from '@/mySky/skyIdentity';
import type { SkywriteRecord } from '@/skywrite/types';
import {
  playSkyActiveUntilFromTimestamp,
  registerPlaySkyPublication,
  type PlaySkySequenceRegistry,
} from '@/skywrite/play/playSkySequenceEligibility';

/** Development-only Explore demo owners — not real users or AI training data. */
export const EXPLORE_DEMO_OWNER_IDS = [
  'demo-sky-avery',
  'demo-sky-river',
  'demo-sky-noor',
] as const;

export type ExploreDemoOwnerId = (typeof EXPLORE_DEMO_OWNER_IDS)[number];

const DEMO_PHOTO = 'https://picsum.photos/seed/reellyou-demo-sky/900/700';
const DEMO_VIDEO =
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4';
const DEMO_AUDIO =
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3';

/** Fixed demo publication times — do not refresh on render (Play Sky 24h uses these). */
const DEMO_PLAY_SKY_EPOCH_MS = Date.parse('2026-09-29T12:00:00.000Z');

function demoIso(hoursAgo: number): string {
  return new Date(DEMO_PLAY_SKY_EPOCH_MS - hoursAgo * 60 * 60 * 1000).toISOString();
}

/** Saved archive — visible on Sky, excluded from Play Sky (>24h). */
const DEMO_ARCHIVED_ISO = '2025-06-01T14:00:00.000Z';

type DemoSkywriteInput = Pick<
  SkywriteRecord,
  'id' | 'text' | 'mediaMode' | 'media' | 'visibility' | 'createdAt'
> &
  Partial<Omit<SkywriteRecord, 'id' | 'text' | 'mediaMode' | 'media' | 'visibility' | 'createdAt'>> & {
    authorId: string;
  };

function post(partial: DemoSkywriteInput): SkywriteRecord {
  return {
    textStyle: 'plain',
    userHashtags: [],
    mood: 'hopeful',
    showingUp: 'reflection',
    intent: 'reflection',
    animateToSky: true,
    allowAIContext: false,
    ...partial,
  };
}

export const EXPLORE_DEMO_PROFILES: Record<ExploreDemoOwnerId, SkyOwnerProfile> = {
  'demo-sky-avery': {
    id: 'demo-sky-avery',
    name: 'Avery Kim',
    subtitle: 'Demo Sky • Growth',
    bio: 'Development example — growth and steady steps.',
    avatarInitials: 'AK',
    avatarColor: '#9B7EDE',
    isSelf: false,
    connectionStatus: 'none',
  },
  'demo-sky-river': {
    id: 'demo-sky-river',
    name: 'River Santos',
    subtitle: 'Demo Sky • Creativity',
    bio: 'Development example — creative courage.',
    avatarInitials: 'RS',
    avatarColor: '#E8C872',
    isSelf: false,
    connectionStatus: 'none',
  },
  'demo-sky-noor': {
    id: 'demo-sky-noor',
    name: 'Noor Ali',
    subtitle: 'Demo Sky • Purpose',
    bio: 'Development example — purpose and voice.',
    avatarInitials: 'NA',
    avatarColor: '#7CB8E8',
    isSelf: false,
    connectionStatus: 'none',
  },
};

export const EXPLORE_DEMO_NORTH_STARS: Record<ExploreDemoOwnerId, string> = {
  'demo-sky-avery': 'Small brave steps, repeated gently.',
  'demo-sky-river': 'Creativity as a daily practice.',
  'demo-sky-noor': 'Purpose shows up in quiet moments.',
};

export const EXPLORE_DEMO_SKYWRITES: Record<ExploreDemoOwnerId, SkywriteRecord[]> = {
  'demo-sky-avery': [
    post({
      id: 'demo-avery-sw-text',
      authorId: 'demo-sky-avery',
      text: 'Today I am choosing patience over perfection.',
      mediaMode: 'text',
      media: { photo: null, video: null, audio: null },
      visibility: 'public',
      skyAreaId: 'growth',
      createdAt: demoIso(2),
    }),
    post({
      id: 'demo-avery-sw-photo',
      authorId: 'demo-sky-avery',
      text: 'A moment of light on the walk home.',
      mediaMode: 'photo',
      media: {
        photo: { uri: DEMO_PHOTO, width: 900, height: 700 },
        video: null,
        audio: null,
      },
      visibility: 'public',
      skyAreaId: 'growth',
      createdAt: demoIso(5),
    }),
    post({
      id: 'demo-avery-sw-video',
      authorId: 'demo-sky-avery',
      text: 'Breathing room before the next step.',
      mediaMode: 'video',
      media: {
        photo: null,
        video: { uri: DEMO_VIDEO, durationMs: 15000 },
        audio: null,
      },
      visibility: 'public',
      skyAreaId: 'purpose',
      createdAt: demoIso(8),
    }),
    post({
      id: 'demo-avery-sw-archived',
      authorId: 'demo-sky-avery',
      text: 'An older saved moment — still on the Sky, not in SkyReel.',
      mediaMode: 'text',
      media: { photo: null, video: null, audio: null },
      visibility: 'public',
      skyAreaId: 'growth',
      createdAt: DEMO_ARCHIVED_ISO,
    }),
  ],
  'demo-sky-river': [
    post({
      id: 'demo-river-sw-text',
      authorId: 'demo-sky-river',
      text: 'Sketching ideas without judging them yet.',
      mediaMode: 'text',
      media: { photo: null, video: null, audio: null },
      visibility: 'public',
      skyAreaId: 'creativity',
      createdAt: demoIso(3),
    }),
    post({
      id: 'demo-river-sw-photo',
      authorId: 'demo-sky-river',
      text: 'Colors that felt honest today.',
      mediaMode: 'photo_voiceover',
      media: {
        photo: { uri: `${DEMO_PHOTO}&sig=river`, width: 900, height: 700 },
        video: null,
        audio: { uri: DEMO_AUDIO, durationMs: 22000 },
      },
      visibility: 'public',
      skyAreaId: 'creativity',
      createdAt: demoIso(6),
    }),
    post({
      id: 'demo-river-sw-audio',
      authorId: 'demo-sky-river',
      text: 'Voice note — why this season matters.',
      mediaMode: 'voice',
      media: {
        photo: null,
        video: null,
        audio: { uri: DEMO_AUDIO, durationMs: 18000 },
      },
      visibility: 'public',
      skyAreaId: 'creativity',
      createdAt: demoIso(10),
    }),
    post({
      id: 'demo-river-sw-archived',
      authorId: 'demo-sky-river',
      text: 'Archive sketch — saved on the Sky only.',
      mediaMode: 'text',
      media: { photo: null, video: null, audio: null },
      visibility: 'public',
      skyAreaId: 'creativity',
      createdAt: DEMO_ARCHIVED_ISO,
    }),
  ],
  'demo-sky-noor': [
    post({
      id: 'demo-noor-sw-text',
      authorId: 'demo-sky-noor',
      text: 'What would “enough” look like this week?',
      mediaMode: 'text',
      media: { photo: null, video: null, audio: null },
      visibility: 'public',
      skyAreaId: 'purpose',
      showingUp: 'question',
      intent: 'question',
      createdAt: demoIso(4),
    }),
    post({
      id: 'demo-noor-sw-video-vo',
      authorId: 'demo-sky-noor',
      text: 'A clip from morning reflection.',
      mediaMode: 'video_voiceover',
      media: {
        photo: null,
        video: { uri: DEMO_VIDEO, durationMs: 15000 },
        audio: { uri: DEMO_AUDIO, durationMs: 15000 },
      },
      visibility: 'public',
      skyAreaId: 'faith',
      createdAt: demoIso(7),
    }),
    post({
      id: 'demo-noor-sw-photo',
      authorId: 'demo-sky-noor',
      text: 'Stillness before the day begins.',
      mediaMode: 'photo',
      media: {
        photo: { uri: `${DEMO_PHOTO}&sig=noor`, width: 900, height: 700 },
        video: null,
        audio: null,
      },
      visibility: 'public',
      skyAreaId: 'faith',
      createdAt: demoIso(11),
    }),
    post({
      id: 'demo-noor-sw-archived',
      authorId: 'demo-sky-noor',
      text: 'Quiet note from last season — not in today’s SkyReel.',
      mediaMode: 'text',
      media: { photo: null, video: null, audio: null },
      visibility: 'public',
      skyAreaId: 'faith',
      createdAt: DEMO_ARCHIVED_ISO,
    }),
  ],
};

export function isExploreDemoOwnerId(ownerId: string): ownerId is ExploreDemoOwnerId {
  return (EXPLORE_DEMO_OWNER_IDS as readonly string[]).includes(ownerId);
}

export function resolveExploreDemoOwnerProfile(ownerId: string): SkyOwnerProfile | null {
  if (!isExploreDemoOwnerId(ownerId)) return null;
  return EXPLORE_DEMO_PROFILES[ownerId];
}

export function resolveExploreDemoSkywrites(ownerId: string): SkywriteRecord[] {
  if (!isExploreDemoOwnerId(ownerId)) return [];
  return EXPLORE_DEMO_SKYWRITES[ownerId];
}

/** Registers demo Play Sky eligibility from fixture timestamps — never refreshes real posts. */
export function mergeExploreDemoPlaySkyRegistry(
  registry: PlaySkySequenceRegistry,
  _nowMs = Date.now(),
): PlaySkySequenceRegistry {
  let next = { ...registry };
  for (const ownerId of EXPLORE_DEMO_OWNER_IDS) {
    for (const demoPost of EXPLORE_DEMO_SKYWRITES[ownerId]) {
      if (next[demoPost.id]) continue;
      next = registerPlaySkyPublication(next, demoPost);
      const entry = next[demoPost.id];
      if (entry) {
        const publishedMs = Date.parse(demoPost.createdAt);
        next[demoPost.id] = {
          ...entry,
          activeUntilMs: playSkyActiveUntilFromTimestamp(
            Number.isFinite(publishedMs) ? publishedMs : DEMO_PLAY_SKY_EPOCH_MS,
          ),
        };
      }
    }
  }
  return next;
}

/** Dev-only: reset in-memory demo registry entries (Help replay / QA). */
export function buildFreshDemoPlaySkyRegistrySlice(): PlaySkySequenceRegistry {
  return mergeExploreDemoPlaySkyRegistry({});
}
