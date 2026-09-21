import type { EmergingGroup } from '@/sharedSky/sharedSkyTypes';

/** FIXTURE-ONLY — not live AI discovery. For local UI/dev when graph has no patterns. */
export const FIXTURE_EMERGING_GROUPS: EmergingGroup[] = [
  {
    id: 'fixture-emerging-creative-courage',
    constellationId: 'fixture-pattern-creative',
    patternId: 'fixture-pattern-creative',
    communityId: null,
    memberNodeIds: [],
    themeIds: ['creativity', 'courage'],
    strengthBand: 'medium',
    primaryReasonCodes: ['like-hearted-themes'],
    lifecycle: 'emerging',
    joined: false,
    dismissed: false,
    createdAt: '2020-01-01T00:00:00.000Z',
    updatedAt: '2020-01-01T00:00:00.000Z',
    lastSurfacedAt: null,
    whyThis:
      'You’ve been returning to themes around creative courage and self-expression. (Fixture example)',
    title: 'Creative courage (fixture)',
  },
];
