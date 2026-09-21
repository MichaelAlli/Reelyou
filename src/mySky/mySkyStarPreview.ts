import { findPatternForNodeId } from '@/mySky/buildConstellationIntelligence';
import type { SkyPattern } from '@/mySky/skyNodeTypes';
import type { MySkyStarDisplay } from '@/mySky/types';

export interface MySkyStarPreview {
  title: string;
  body: string;
  eyebrow?: string;
}

const TYPE_FALLBACKS: Record<string, MySkyStarPreview> = {
  skywrite: {
    eyebrow: 'Reflection',
    title: 'A moment you chose to release',
    body: 'This star holds something you wrote into the sky — a feeling, insight, or chapter worth returning to.',
  },
  connection: {
    eyebrow: 'Connection',
    title: 'Connection Star',
    body: 'This reflects people and communities shaping your path — threads of belonging and shared momentum.',
  },
  community: {
    eyebrow: 'Community',
    title: 'Shared orbit',
    body: 'A place where your story intersects with others — growth through shared purpose and presence.',
  },
  guidance: {
    eyebrow: 'Guidance',
    title: 'Guiding light',
    body: 'A quiet signal of direction — something asking for your attention with care, not pressure.',
  },
  contribution: {
    eyebrow: 'Impact',
    title: 'Contribution Star',
    body: 'A marker of how your presence ripples outward — small acts that still matter in your sky.',
  },
  moment: {
    eyebrow: 'Memory',
    title: 'Memory anchor',
    body: 'A reflection point in your history — not fixed, but alive as you keep becoming.',
  },
};

const TITLE_HINTS: { match: RegExp; preview: MySkyStarPreview }[] = [
  {
    match: /confidence|courage|trust/i,
    preview: {
      eyebrow: 'Becoming',
      title: 'Confidence Star',
      body: 'You’ve been returning to courage and self-trust — a steady warmth forming in your sky.',
    },
  },
  {
    match: /connect|community|friend|orbit/i,
    preview: {
      eyebrow: 'Connection',
      title: 'Connection Star',
      body: 'This reflects people and communities shaping your path — relationships that help you feel seen.',
    },
  },
  {
    match: /purpose|north|direction|path/i,
    preview: {
      eyebrow: 'Direction',
      title: 'Purpose Star',
      body: 'A deeper long-term direction is beginning to take form — still emerging, already meaningful.',
    },
  },
  {
    match: /creat|express|idea|imagine/i,
    preview: {
      eyebrow: 'Expression',
      title: 'Creativity Star',
      body: 'Your expression, ideas, and imagination are becoming more active — a brightening creative thread.',
    },
  },
  {
    match: /growth|evolv|learn|practice/i,
    preview: {
      eyebrow: 'Growth',
      title: 'Growth Star',
      body: 'A signal of growth — something in you is stretching, integrating, and finding new shape.',
    },
  },
];

const GENERIC: MySkyStarPreview = {
  eyebrow: 'Possibility',
  title: 'A star in your sky',
  body: 'This point in your sky marks something meaningful forming — tap deeper when you’re ready to explore it fully.',
};

export function resolveMySkyStarPreview(
  star: MySkyStarDisplay,
  patterns: SkyPattern[] = [],
): MySkyStarPreview {
  if (star.isIdentityStar) {
    return {
      eyebrow: 'Identity',
      title: 'Your Identity Star',
      body: 'This is you within your living Sky. It reflects who you are becoming as your experiences, choices, relationships, and growth evolve.',
    };
  }

  const pattern = findPatternForNodeId(patterns, star.id);
  if (pattern) {
    return {
      eyebrow: 'Pattern forming',
      title: pattern.label ?? 'A pattern taking shape',
      body: pattern.note ?? 'Related stars are beginning to connect — a gentle glimpse of what could emerge.',
    };
  }

  const titled = star.title?.trim();
  if (titled) {
    for (const entry of TITLE_HINTS) {
      if (entry.match.test(titled)) return { ...entry.preview, title: titled };
    }
    return {
      eyebrow: TYPE_FALLBACKS[star.type]?.eyebrow ?? 'In your sky',
      title: titled,
      body: TYPE_FALLBACKS[star.type]?.body ?? GENERIC.body,
    };
  }

  return TYPE_FALLBACKS[star.type] ?? GENERIC;
}
