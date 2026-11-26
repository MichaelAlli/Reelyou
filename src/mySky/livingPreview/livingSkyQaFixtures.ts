import { EXPLORE_DEMO_SKYWRITES } from '@/explore/exploreDemoSkies';
import type { SkywriteRecord } from '@/skywrite/types';

/** Existing synthetic Explore demo owner. Read-only. Never written to an account. */
export const LIVING_SKY_QA_OWNER_ID = 'demo-sky-avery';

export type LivingSkyQaFixture = 'three' | 'one' | 'none' | 'visitor' | 'manual';

function demoPosts(): SkywriteRecord[] {
  return EXPLORE_DEMO_SKYWRITES[LIVING_SKY_QA_OWNER_ID].map((post) => ({ ...post, media: { ...post.media } }));
}

export function parseLivingSkyQaFixture(value: string | string[] | undefined): LivingSkyQaFixture {
  const raw = Array.isArray(value) ? value[0] : value;
  if (raw === 'one' || raw === 'none' || raw === 'visitor' || raw === 'manual' || raw === 'three') {
    return raw;
  }
  return 'three';
}

/** Synthetic, read-only posts cloned from the existing demo sky. Nothing is persisted. */
export function livingSkyQaPosts(fixture: LivingSkyQaFixture): SkywriteRecord[] {
  const posts = demoPosts();
  const text = posts.find((post) => post.id === 'demo-avery-sw-text');
  const photo = posts.find((post) => post.id === 'demo-avery-sw-photo');
  const video = posts.find((post) => post.id === 'demo-avery-sw-video');
  if (!text || !photo || !video) return [];

  if (fixture === 'none') return [];
  if (fixture === 'one') return [photo];
  if (fixture === 'visitor') {
    return [
      text,
      photo,
      video,
      {
        ...text,
        id: 'demo-avery-sw-private-qa',
        text: 'A private reflection visitors must not see.',
        visibility: 'private',
        createdAt: '2026-09-29T15:00:00.000Z',
      },
      {
        ...text,
        id: 'demo-avery-sw-friends-qa',
        text: 'A Sky Friends note for mutual skies only.',
        visibility: 'sky_friends',
        createdAt: '2026-09-29T14:00:00.000Z',
      },
    ];
  }
  return [text, photo, video];
}

export const LIVING_SKY_QA_MANUAL_IDS = ['demo-avery-sw-photo', 'demo-avery-sw-text'] as const;
