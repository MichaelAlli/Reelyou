import type { SkywriteRecord } from '@/skywrite/types';

import { filterSkywritesForStarpathPersonalization } from '@/journey/journeyStarpathEligibility';

export interface JourneyTextSignals {
  /** User-stated goals copied from phrasing — treated as explicit, not inferred. */
  explicitStatements: string[];
  /** Low-confidence recurring tokens — tentative only for ranking hints. */
  tentativeThemeTokens: string[];
  /** Keyword hints for resource discovery — derived from explicit phrasing only. */
  keywordHints: string[];
}

const EXPLICIT_GOAL_PATTERNS = [
  /\b(?:i\s+want\s+to\s+become\s+)([^.!?\n]{3,120})/gi,
  /\b(?:i\s+want\s+to\s+)([^.!?\n]{3,120})/gi,
  /\b(?:my\s+goal\s+is\s+(?:to\s+)?)([^.!?\n]{3,120})/gi,
  /\b(?:i\s+am\s+working\s+(?:toward|on)\s+)([^.!?\n]{3,120})/gi,
];

const NEED_PATTERNS = [
  /\b(?:i\s+need\s+help\s+(?:with|finding)\s+)([^.!?\n]{3,120})/gi,
  /\b(?:looking\s+for\s+)([^.!?\n]{3,120})/gi,
];

const ACTIVITY_PATTERNS = [
  /\b(?:i(?:'m|\s+am)\s+taking\s+)([^.!?\n]{3,120})/gi,
  /\b(?:i(?:'ve|\s+have)\s+been\s+)([^.!?\n]{3,120})/gi,
];

function normalizePhrase(raw: string): string {
  return raw.replace(/\s+/g, ' ').trim().slice(0, 160);
}

function collectMatches(text: string, patterns: RegExp[]): string[] {
  const out: string[] = [];
  for (const pattern of patterns) {
    pattern.lastIndex = 0;
    let match = pattern.exec(text);
    while (match) {
      const phrase = normalizePhrase(match[1] ?? '');
      if (phrase.length >= 3) out.push(phrase);
      match = pattern.exec(text);
    }
  }
  return out;
}

function tokenizeThemes(text: string): string[] {
  const lower = text.toLowerCase();
  const themes: string[] = [];
  const checks: [RegExp, string][] = [
    [/\bact(?:ing|or|ress)\b/, 'acting'],
    [/\baudition/, 'audition'],
    [/\bstartup\b|\bentrepreneur/, 'entrepreneurship'],
    [/\bfunding\b|\bgrant\b/, 'funding'],
    [/\bclass(?:es)?\b|\btraining\b/, 'training'],
    [/\brepresentation\b|\bagent\b/, 'representation'],
  ];
  for (const [re, token] of checks) {
    if (re.test(lower)) themes.push(token);
  }
  return themes;
}

/** Conservative NLP from user Skywrite body text — no external AI; honors allowAIContext via caller filter. */
export function extractJourneyTextSignalsFromPosts(
  posts: readonly Pick<SkywriteRecord, 'text' | 'visibility' | 'allowAIContext'>[],
): JourneyTextSignals {
  const explicitStatements: string[] = [];
  const tentativeThemeTokens: string[] = [];
  const keywordHints: string[] = [];

  for (const post of posts) {
    const text = post.text?.trim() ?? '';
    if (!text) continue;

    for (const phrase of collectMatches(text, EXPLICIT_GOAL_PATTERNS)) {
      explicitStatements.push(phrase);
      keywordHints.push(phrase);
    }
    for (const phrase of collectMatches(text, ACTIVITY_PATTERNS)) {
      explicitStatements.push(phrase);
      keywordHints.push(phrase);
    }
    for (const phrase of collectMatches(text, NEED_PATTERNS)) {
      explicitStatements.push(phrase);
      keywordHints.push(phrase);
    }

    tentativeThemeTokens.push(...tokenizeThemes(text));
  }

  const dedupe = (list: string[]) => [...new Set(list.map((s) => s.toLowerCase()))].slice(0, 24);

  return {
    explicitStatements: [...new Set(explicitStatements.map(normalizePhrase))].slice(0, 12),
    tentativeThemeTokens: dedupe(tentativeThemeTokens),
    keywordHints: [...new Set(keywordHints.map(normalizePhrase))].slice(0, 16),
  };
}

export function extractJourneyTextSignalsFromProfileSkywrites(
  skywrites: readonly SkywriteRecord[] | undefined,
): JourneyTextSignals {
  const eligible = filterSkywritesForStarpathPersonalization(skywrites ?? []);
  return extractJourneyTextSignalsFromPosts(eligible);
}
