const STOP_WORDS = new Set([
  'a',
  'an',
  'the',
  'for',
  'to',
  'my',
  'on',
  'in',
  'at',
  'and',
  'or',
  'with',
  'today',
  'this',
  'that',
  'about',
  'into',
  'of',
  'is',
  'be',
  'i',
  'me',
]);

export function tokenizeFocusText(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, ' ')
    .split(/\s+/)
    .map((token) => token.trim())
    .filter((token) => token.length > 2 && !STOP_WORDS.has(token));
}

/** Simple lexical overlap — no hidden ML scoring exposed to UI. */
export function focusTextRelevanceScore(focusText: string, corpus: string): number {
  const focusTokens = tokenizeFocusText(focusText);
  if (focusTokens.length === 0) return 0;
  const haystack = corpus.toLowerCase();
  let hits = 0;
  for (const token of focusTokens) {
    if (haystack.includes(token)) hits += 1;
  }
  return hits / focusTokens.length;
}

export function focusTextFingerprint(text: string): string {
  return text.trim().toLowerCase().replace(/\s+/g, ' ');
}
