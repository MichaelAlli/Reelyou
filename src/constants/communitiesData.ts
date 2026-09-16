import type { CommunityId } from '@/onboarding/personalization/communities/types';

export type CommunityIconType =
  | 'briefcase'
  | 'leaf'
  | 'creative'
  | 'community'
  | 'career'
  | 'wellness'
  | 'leadership'
  | 'travel';

export interface CommunityDefinition {
  id: CommunityId;
  name: string;
  description: string;
  icon: CommunityIconType;
  section: 'growing-in' | 'explore';
  about: string;
  moments: string[];
}

export const COMMUNITIES: CommunityDefinition[] = [
  {
    id: 'entrepreneurship',
    name: 'Entrepreneurship',
    description:
      'Building ideas, courage, and momentum with people creating something of their own.',
    icon: 'briefcase',
    section: 'growing-in',
    about:
      'A calm space for people building something meaningful — sharing ideas, learning from each other, and finding courage to keep going.',
    moments: [
      'Someone shared how they took their first small step toward a side project.',
      'A conversation about balancing ambition with rest and self-trust.',
    ],
  },
  {
    id: 'personal-growth',
    name: 'Personal Growth',
    description:
      'Conversations and experiences that support becoming more intentional.',
    icon: 'leaf',
    section: 'growing-in',
    about:
      'For people who want to grow with intention — reflecting on habits, values, and the person they are becoming.',
    moments: [
      'A member wrote about choosing patience over pressure in a hard week.',
      'Someone asked what “enough” looks like when striving for change.',
    ],
  },
  {
    id: 'creativity',
    name: 'Creativity',
    description:
      'A place for ideas, expression, experimentation, and making things that matter.',
    icon: 'creative',
    section: 'growing-in',
    about:
      'A welcoming space to share creative work, unfinished ideas, and the courage to experiment without needing perfection.',
    moments: [
      'Someone posted a sketch they were nervous to share — and found warm encouragement.',
      'A thread on making time for creative work alongside everyday life.',
    ],
  },
  {
    id: 'purpose-seekers',
    name: 'Purpose Seekers',
    description:
      'People exploring meaning, direction, contribution, and what matters most.',
    icon: 'community',
    section: 'growing-in',
    about:
      'For people asking deeper questions about direction, contribution, and what a meaningful life looks like for them.',
    moments: [
      'A quiet reflection on finding purpose through service, not status.',
      'Someone shared how a small act of kindness shifted their perspective.',
    ],
  },
  {
    id: 'career-growth',
    name: 'Career Growth',
    description: 'Thoughtful conversations about work, skill-building, and professional direction.',
    icon: 'career',
    section: 'explore',
    about:
      'Explore career transitions, skill development, and building work that aligns with who you are.',
    moments: [
      'A member asked for perspective on changing fields mid-career.',
    ],
  },
  {
    id: 'wellness',
    name: 'Wellness',
    description: 'Gentle support for balance, rest, and caring for yourself as you grow.',
    icon: 'wellness',
    section: 'explore',
    about:
      'A space focused on sustainable wellbeing — not hustle culture, but honest care for body and mind.',
    moments: [
      'Someone shared a simple morning ritual that helped them feel grounded.',
    ],
  },
  {
    id: 'leadership',
    name: 'Leadership',
    description: 'Growing as someone others can trust — with humility and clarity.',
    icon: 'leadership',
    section: 'explore',
    about:
      'For people learning to lead with empathy, clarity, and integrity in work and community.',
    moments: [
      'A conversation about listening more than speaking in hard moments.',
    ],
  },
  {
    id: 'travel-culture',
    name: 'Travel & Culture',
    description: 'Stories and perspectives from people exploring the world and each other.',
    icon: 'travel',
    section: 'explore',
    about:
      'Connect through travel stories, cultural curiosity, and the ways new places change how we see ourselves.',
    moments: [
      'Someone reflected on what they learned living somewhere new for a month.',
    ],
  },
];

/** Home Growing In pill order — index-aligned with HomeCopy.growingInPills. */
export const GROWING_IN_COMMUNITY_IDS: CommunityId[] = [
  'entrepreneurship',
  'personal-growth',
  'creativity',
  'purpose-seekers',
];

const BY_ID = new Map(COMMUNITIES.map((community) => [community.id, community]));

export function getCommunityById(id: string | undefined): CommunityDefinition | null {
  if (!id) return null;
  return BY_ID.get(id as CommunityId) ?? null;
}

export function getGrowingInCommunities(): CommunityDefinition[] {
  return GROWING_IN_COMMUNITY_IDS.map((id) => BY_ID.get(id)!);
}

export function getExploreCommunities(): CommunityDefinition[] {
  return COMMUNITIES.filter((community) => community.section === 'explore');
}
