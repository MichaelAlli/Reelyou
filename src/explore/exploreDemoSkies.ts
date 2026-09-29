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

function recentIso(hoursAgo: number): string {
  return new Date(Date.now() - hoursAgo * 60 * 60 * 1000).toISOString();
}

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
      createdAt: recentIso(2),
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
      createdAt: recentIso(5),
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
      createdAt: recentIso(8),
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
      createdAt: recentIso(3),
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
      createdAt: recentIso(6),
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
      createdAt: recentIso(10),
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
      createdAt: recentIso(4),
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
      createdAt: recentIso(7),
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
      createdAt: recentIso(11),
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

/** Keeps demo Play Sky entries inside the 24h window without touching real posts. */
export function mergeExploreDemoPlaySkyRegistry(
  registry: PlaySkySequenceRegistry,
  nowMs = Date.now(),
): PlaySkySequenceRegistry {
  let next = { ...registry };
  for (const ownerId of EXPLORE_DEMO_OWNER_IDS) {
    for (const post of EXPLORE_DEMO_SKYWRITES[ownerId]) {
      const stamped = { ...post, createdAt: new Date(nowMs - 60_000).toISOString() };
      next = registerPlaySkyPublication(next, stamped);
      const entry = next[stamped.id];
      if (entry) {
        next[stamped.id] = {
          ...entry,
          activeUntilMs: playSkyActiveUntilFromTimestamp(nowMs),
        };
      }
    }
  }
  return next;
}
