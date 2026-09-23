import type { SkywriteRecord } from '@/skywrite/types';

/** Beta orbit-owner Skywrites for visitor profile filtering QA — not a second state store. */
export const ORBIT_PROFILE_SKYWRITE_FIXTURES: Record<string, SkywriteRecord[]> = {
  'orbit-jordan': [
    {
      id: 'orbit-jordan-sw-1',
      authorId: 'orbit-jordan',
      text: 'What helps you stay steady during growth seasons?',
      textStyle: 'plain',
      media: { photo: null, audio: null },
      mediaMode: 'text',
      visibility: 'public',
      mood: 'hopeful',
      showingUp: 'question',
      intent: 'question',
      userHashtags: ['growth'],
      skyAreaId: 'growth',
      animateToSky: true,
      allowAIContext: true,
      createdAt: '2026-09-20T12:00:00.000Z',
    },
    {
      id: 'orbit-jordan-sw-2',
      authorId: 'orbit-jordan',
      text: 'Purpose is showing up even when the path is unclear.',
      textStyle: 'plain',
      media: { photo: null, audio: null },
      mediaMode: 'text',
      visibility: 'public',
      mood: 'reflective',
      showingUp: 'reflection',
      userHashtags: ['purpose'],
      skyAreaId: 'purpose',
      animateToSky: false,
      allowAIContext: true,
      createdAt: '2026-09-19T12:00:00.000Z',
    },
    {
      id: 'orbit-jordan-sw-3',
      authorId: 'orbit-jordan',
      text: 'Private creative draft — not for visitors.',
      textStyle: 'plain',
      media: { photo: null, audio: null },
      mediaMode: 'text',
      visibility: 'private',
      mood: null,
      showingUp: 'reflection',
      userHashtags: ['creativity'],
      skyAreaId: 'creativity',
      animateToSky: false,
      allowAIContext: false,
      createdAt: '2026-09-18T12:00:00.000Z',
    },
  ],
};

export function resolveOrbitOwnerSkywrites(ownerId: string): SkywriteRecord[] {
  return ORBIT_PROFILE_SKYWRITE_FIXTURES[ownerId] ?? [];
}
