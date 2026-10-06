import { readStarpathScopedJson, writeStarpathScopedJson } from '@/starpath/starpathScopedStorage';
import {
  DEFAULT_EMOTIONAL_CONTEXT,
  type StarPathEmotionalContext,
  type UserSupportState,
} from '@/starpath/starpathEmotionalContextTypes';

const STORAGE_KEY = '@reellyou/starpath-emotional-context';

export async function loadEmotionalContext(): Promise<StarPathEmotionalContext> {
  try {
    const raw = await readStarpathScopedJson(STORAGE_KEY, (value) => value);
    if (!raw) return { ...DEFAULT_EMOTIONAL_CONTEXT };
    return { ...DEFAULT_EMOTIONAL_CONTEXT, ...(JSON.parse(raw) as StarPathEmotionalContext) };
  } catch {
    return { ...DEFAULT_EMOTIONAL_CONTEXT };
  }
}

export async function saveEmotionalContext(ctx: StarPathEmotionalContext): Promise<void> {
  await writeStarpathScopedJson(STORAGE_KEY, ctx);
}

export function parseUserReportedSupport(label: string | null | undefined): UserSupportState {
  if (!label) return 'unknown';
  const t = label.toLowerCase();
  if (t.includes('overwhelm') || t.includes('too much')) return 'overloaded';
  if (t.includes('excited') || t.includes('energ')) return 'energized';
  if (t.includes('unsure') || t.includes('uncertain') || t.includes('stuck')) return 'uncertain';
  if (t.includes('reflect') || t.includes('quiet')) return 'reflective';
  if (t.includes('tired') || t.includes('disengag')) return 'disengaged';
  if (t.includes('calm') || t.includes('hopeful')) return 'calm';
  return 'unknown';
}
