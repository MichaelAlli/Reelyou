import type { SkyEvolutionEntry, SkyEvolutionRecord } from '@/mySky/skyEvolution';
import type { SkyGrowthEventType, SkyProvenanceSource } from '@/mySky/skyNodeTypes';

/** User-facing history row — no raw ids or technical event names. */
export interface SkyHistoryItem {
  key: string;
  title: string;
  dateLabel: string;
  sourceLabel: string;
  summary: string;
}

const EVENT_TITLES: Record<SkyGrowthEventType, string> = {
  SKYWRITE_CREATED: 'New Skywrite',
  SKYWRITE_UPDATED: 'Skywrite updated',
  COMMUNITY_JOINED: 'Community joined your sky',
  COMMUNITY_LEFT: 'Community left your sky',
  FOCUS_SELECTED: 'Today’s Focus chosen',
  FOCUS_CLEARED: 'Today’s Focus cleared',
  REFLECTION_ADDED: 'Reflection added',
  CONNECTION_FORMED: 'Connection formed',
  PATTERN_ACCEPTED: 'Pattern recognized',
  PATTERN_DISMISSED: 'Pattern released',
};

const SOURCE_LABELS: Record<SkyProvenanceSource, string> = {
  explicit: 'From you',
  inferred: 'From a pattern',
  system: 'From your sky',
};

const DEFAULT_HISTORY_LIMIT = 24;

function formatHistoryDate(iso: string): string {
  try {
    const date = new Date(iso);
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfEntry = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const dayDiff = Math.round(
      (startOfToday.getTime() - startOfEntry.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (dayDiff === 0) return 'Today';
    if (dayDiff === 1) return 'Yesterday';
    return date.toLocaleDateString(undefined, {
      month: 'long',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    });
  } catch {
    return '';
  }
}

function dedupeHistoryEntries(entries: SkyEvolutionEntry[]): SkyEvolutionEntry[] {
  const seen = new Set<string>();
  const result: SkyEvolutionEntry[] = [];

  for (const entry of entries) {
    const dayKey = entry.occurredAt.slice(0, 10);
    const fingerprint = `${entry.eventType}|${dayKey}|${entry.summary.trim()}`;
    if (seen.has(fingerprint)) continue;
    seen.add(fingerprint);
    result.push(entry);
  }

  return result;
}

function toHistoryItem(entry: SkyEvolutionEntry, index: number): SkyHistoryItem {
  return {
    key: `${entry.occurredAt}-${entry.eventType}-${index}`,
    title: EVENT_TITLES[entry.eventType] ?? 'Sky moment',
    dateLabel: formatHistoryDate(entry.occurredAt),
    sourceLabel: SOURCE_LABELS[entry.source] ?? SOURCE_LABELS.explicit,
    summary: entry.summary.trim(),
  };
}

/** Project evolution record into a calm, finite chronological history list. */
export function buildSkyHistoryView(
  evolution: SkyEvolutionRecord,
  limit = DEFAULT_HISTORY_LIMIT,
): SkyHistoryItem[] {
  const sorted = [...evolution.entries].sort(
    (a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime(),
  );

  return dedupeHistoryEntries(sorted)
    .slice(0, limit)
    .map((entry, index) => toHistoryItem(entry, index));
}
