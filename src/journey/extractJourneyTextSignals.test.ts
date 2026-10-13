import { extractJourneyTextSignalsFromPosts } from '@/journey/extractJourneyTextSignals';

function assert(condition: boolean, message: string) {
  if (!condition) throw new Error(message);
}

const actingPosts = [
  {
    text: 'I want to become a professional actor.',
    visibility: 'public' as const,
    allowAIContext: true,
  },
  {
    text: "I'm taking acting classes to improve my skills.",
    visibility: 'public' as const,
    allowAIContext: true,
  },
  {
    text: "I've been auditioning but need help finding representation.",
    visibility: 'public' as const,
    allowAIContext: true,
  },
];

const acting = extractJourneyTextSignalsFromPosts(actingPosts);
assert(
  acting.explicitStatements.some((s) => s.toLowerCase().includes('professional actor')),
  'explicit acting goal',
);
assert(acting.tentativeThemeTokens.includes('acting'), 'acting theme token');
assert(acting.tentativeThemeTokens.includes('audition'), 'audition theme');
assert(acting.tentativeThemeTokens.includes('representation'), 'representation need');

const entrepreneurPosts = [
  { text: 'I want to launch my startup this year.', visibility: 'public' as const, allowAIContext: true },
  { text: 'Looking for funding for our product.', visibility: 'public' as const, allowAIContext: true },
];
const ent = extractJourneyTextSignalsFromPosts(entrepreneurPosts);
assert(ent.tentativeThemeTokens.includes('entrepreneurship'), 'entrepreneur theme');
assert(ent.tentativeThemeTokens.includes('funding'), 'funding theme');

console.log('[extractJourneyTextSignals.test] ok');
