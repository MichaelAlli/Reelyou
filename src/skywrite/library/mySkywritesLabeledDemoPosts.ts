import { currentUser } from '@/data/mockData';
import type { SkywriteRecord } from '@/skywrite/types';

/** Dev-only labeled samples for My Skywrites → Recent QA — never real user activity. */
export const MY_SKYWRITES_LABELED_DEMO_PREFIX = 'demo-labeled-recent-';

const SAMPLE_VIDEO =
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4';
const SAMPLE_PORTRAIT_VIDEO =
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4';

export function buildMySkywritesLabeledDemoPosts(): SkywriteRecord[] {
  const authorId = currentUser.id;
  const now = Date.now();
  return [
    {
      id: `${MY_SKYWRITES_LABELED_DEMO_PREFIX}growth-video`,
      authorId,
      text: 'What I learned rebuilding after a difficult season',
      textStyle: 'plain',
      media: {
        photo: null,
        video: {
          uri: SAMPLE_PORTRAIT_VIDEO,
          width: 720,
          height: 1280,
          durationMs: 15000,
        },
        audio: null,
        originalVideoAudio: 'on',
        originalVideoVolume: 1,
      },
      mediaMode: 'video',
      visibility: 'private',
      mood: 'reflective',
      showingUp: 'reflection',
      intent: 'reflection',
      userHashtags: ['growth'],
      skyAreaId: 'growth',
      animateToSky: false,
      allowAIContext: false,
      createdAt: new Date(now - 4 * 86400000).toISOString(),
    },
    {
      id: `${MY_SKYWRITES_LABELED_DEMO_PREFIX}purpose-image`,
      authorId,
      text: 'Why I’m starting this project',
      textStyle: 'plain',
      media: {
        photo: {
          uri: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&q=80',
          width: 800,
          height: 533,
        },
        video: null,
        audio: null,
      },
      mediaMode: 'photo',
      visibility: 'private',
      mood: 'hopeful',
      showingUp: 'reflection',
      intent: 'reflection',
      userHashtags: ['purpose'],
      skyAreaId: 'purpose',
      animateToSky: false,
      allowAIContext: false,
      createdAt: new Date(now - 3 * 86400000).toISOString(),
    },
    {
      id: `${MY_SKYWRITES_LABELED_DEMO_PREFIX}creativity-video`,
      authorId,
      text: 'An idea I want to bring to life',
      textStyle: 'plain',
      media: {
        photo: null,
        video: {
          uri: SAMPLE_VIDEO,
          width: 1280,
          height: 720,
          durationMs: 15000,
        },
        audio: null,
        originalVideoAudio: 'lower',
        originalVideoVolume: 0.22,
      },
      mediaMode: 'video',
      visibility: 'private',
      mood: 'determined',
      showingUp: 'reflection',
      intent: 'reflection',
      userHashtags: ['creativity'],
      skyAreaId: 'creativity',
      animateToSky: false,
      allowAIContext: false,
      createdAt: new Date(now - 2 * 86400000).toISOString(),
    },
    {
      id: `${MY_SKYWRITES_LABELED_DEMO_PREFIX}learning-text`,
      authorId,
      text: 'A small step I took today',
      textStyle: 'plain',
      media: { photo: null, video: null, audio: null },
      mediaMode: 'text',
      visibility: 'private',
      mood: 'peaceful',
      showingUp: 'reflection',
      intent: 'reflection',
      userHashtags: ['learning'],
      skyAreaId: 'learning',
      animateToSky: false,
      allowAIContext: false,
      createdAt: new Date(now - 86400000).toISOString(),
    },
  ];
}

export function isMySkywritesLabeledDemoPost(id: string): boolean {
  return id.startsWith(MY_SKYWRITES_LABELED_DEMO_PREFIX);
}
