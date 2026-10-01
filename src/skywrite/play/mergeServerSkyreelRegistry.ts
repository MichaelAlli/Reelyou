import {
  type PlaySkySequenceRegistry,
  playSkyActiveUntilFromTimestamp,
} from '@/skywrite/play/playSkySequenceEligibility';

export type ServerSkyreelFields = {
  id: string;
  authorUserId: string;
  createdAt: number;
  skyreelActiveUntilMs?: number | null;
  skyreelRepostedAtMs?: number | null;
};

/** Merge authoritative server Skyreel timestamps into the local registry. */
export function mergeServerSkyreelIntoRegistry(
  registry: PlaySkySequenceRegistry,
  rows: readonly ServerSkyreelFields[],
): PlaySkySequenceRegistry {
  if (rows.length === 0) return registry;
  const next: PlaySkySequenceRegistry = { ...registry };
  for (const row of rows) {
    const publishedAt = new Date(row.createdAt).toISOString();
    const activeUntilMs =
      row.skyreelActiveUntilMs ?? playSkyActiveUntilFromTimestamp(row.createdAt);
    const existing = next[row.id];
    next[row.id] = {
      skywriteId: row.id,
      ownerId: row.authorUserId,
      publishedAt: existing?.publishedAt ?? publishedAt,
      activeUntilMs,
      repostedAtMs: row.skyreelRepostedAtMs ?? existing?.repostedAtMs,
    };
  }
  return next;
}
