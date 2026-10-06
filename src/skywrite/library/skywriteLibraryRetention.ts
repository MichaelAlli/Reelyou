import type { SkywriteDraft, SkywriteRecord } from '@/skywrite/types';

/** Owner library Recent window from original publication — not reset by SkyReel repost. */
export const SKYWRITE_RECENT_RETENTION_MS = 30 * 24 * 60 * 60 * 1000;

export function parsePublishedAtMs(record: Pick<SkywriteRecord, 'createdAt' | 'publishedAtMs'>): number {
  if (
    typeof record.publishedAtMs === 'number' &&
    Number.isFinite(record.publishedAtMs) &&
    record.publishedAtMs > 0
  ) {
    return record.publishedAtMs;
  }
  const parsed = Date.parse(record.createdAt);
  return Number.isFinite(parsed) ? parsed : Date.now();
}

export function resolveRecentVisibleUntilMs(record: SkywriteRecord, nowMs = Date.now()): number | null {
  if (
    typeof record.recentVisibleUntilMs === 'number' &&
    Number.isFinite(record.recentVisibleUntilMs)
  ) {
    return record.recentVisibleUntilMs;
  }
  if (record.inYourJourney) return null;
  if (record.recentVisibleUntilMs === undefined && record.publishedAtMs === undefined) {
    return null;
  }
  return parsePublishedAtMs(record) + SKYWRITE_RECENT_RETENTION_MS;
}

/** Legacy posts without retention metadata stay visible in Recent (no retroactive expiry). */
export function isSkywriteInRecentLibrary(record: SkywriteRecord, nowMs = Date.now()): boolean {
  if (record.inYourJourney) return true;
  const until = resolveRecentVisibleUntilMs(record, nowMs);
  if (until == null) return true;
  return nowMs < until;
}

export function isSkywriteInYourJourney(record: SkywriteRecord): boolean {
  return record.inYourJourney === true;
}

export function applyPublishRetentionFields(
  record: SkywriteRecord,
  draft: Pick<SkywriteDraft, 'addToYourJourney'>,
  nowMs = Date.now(),
): SkywriteRecord {
  const publishedAtMs = parsePublishedAtMs(record);
  const add = draft.addToYourJourney === true;
  return {
    ...record,
    publishedAtMs,
    recentVisibleUntilMs: publishedAtMs + SKYWRITE_RECENT_RETENTION_MS,
    inYourJourney: add,
    journeyAddedAtMs: add ? nowMs : record.journeyAddedAtMs ?? null,
  };
}

export function applyAddToYourJourney(record: SkywriteRecord, nowMs = Date.now()): SkywriteRecord {
  if (record.inYourJourney) return record;
  return {
    ...record,
    inYourJourney: true,
    journeyAddedAtMs: nowMs,
    publishedAtMs: parsePublishedAtMs(record),
  };
}

export function mergeServerRetentionOntoRecord(
  record: SkywriteRecord,
  server: {
    publishedAtMs?: number | null;
    recentVisibleUntilMs?: number | null;
    inYourJourney?: boolean | null;
    journeyAddedAtMs?: number | null;
    skyreelActiveUntilMs?: number | null;
    skyreelRepostedAtMs?: number | null;
  },
): SkywriteRecord {
  return {
    ...record,
    publishedAtMs:
      typeof server.publishedAtMs === 'number' && Number.isFinite(server.publishedAtMs)
        ? server.publishedAtMs
        : record.publishedAtMs,
    recentVisibleUntilMs:
      typeof server.recentVisibleUntilMs === 'number' && Number.isFinite(server.recentVisibleUntilMs)
        ? server.recentVisibleUntilMs
        : record.recentVisibleUntilMs,
    inYourJourney:
      typeof server.inYourJourney === 'boolean' ? server.inYourJourney : record.inYourJourney,
    journeyAddedAtMs:
      typeof server.journeyAddedAtMs === 'number' && Number.isFinite(server.journeyAddedAtMs)
        ? server.journeyAddedAtMs
        : record.journeyAddedAtMs,
    skyreelActiveUntilMs:
      typeof server.skyreelActiveUntilMs === 'number' && Number.isFinite(server.skyreelActiveUntilMs)
        ? server.skyreelActiveUntilMs
        : record.skyreelActiveUntilMs,
    skyreelRepostedAtMs:
      typeof server.skyreelRepostedAtMs === 'number' && Number.isFinite(server.skyreelRepostedAtMs)
        ? server.skyreelRepostedAtMs
        : record.skyreelRepostedAtMs,
  };
}
