/**
 * Parse explicit user-authored hashtags from Skywrite text.
 * Normalizes structured output (lowercase, deduped) without altering visible text.
 */
export function parseUserHashtags(text: string): string[] {
  const regex = /#([A-Za-z][A-Za-z0-9_]*)/g;
  const seen = new Set<string>();
  const tags: string[] = [];
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    const tag = match[1].toLowerCase();
    if (!seen.has(tag)) {
      seen.add(tag);
      tags.push(tag);
    }
  }

  return tags;
}
