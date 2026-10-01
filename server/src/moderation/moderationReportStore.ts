import { randomUUID } from 'node:crypto';

import { loadAccountDatabase, persistAccountDatabase } from '../db/accountStore.js';

export type ModerationReportTargetType =
  | 'user'
  | 'skywrite'
  | 'message'
  | 'reply'
  | 'community_post';

export interface StoredModerationReport {
  id: string;
  reporterUserId: string;
  targetType: ModerationReportTargetType;
  targetId: string;
  targetOwnerUserId: string | null;
  reason: string;
  optionalNote: string | null;
  createdAt: number;
  status: 'submitted' | 'under_review';
  visibilityContext: string | null;
  provenanceIds: string[];
}

const DUPLICATE_WINDOW_MS = 24 * 60 * 60 * 1000;

function dbReports(): StoredModerationReport[] {
  const store = loadAccountDatabase();
  if (!store.moderationReports) store.moderationReports = [];
  return store.moderationReports;
}

function dedupeKey(input: {
  reporterUserId: string;
  targetType: string;
  targetId: string;
}): string {
  return `${input.reporterUserId}:${input.targetType}:${input.targetId}`;
}

export function submitModerationReport(input: {
  reporterUserId: string;
  targetType: ModerationReportTargetType;
  targetId: string;
  targetOwnerUserId?: string | null;
  reason: string;
  optionalNote?: string | null;
  visibilityContext?: string | null;
  provenanceIds?: string[];
}): { ok: true; reportId: string; duplicate: boolean } | { ok: false; error: string } {
  const targetId = input.targetId.trim();
  const reason = input.reason.trim();
  if (!targetId || !reason) return { ok: false, error: 'invalid_request' };

  const now = Date.now();
  const reports = dbReports();
  const key = dedupeKey(input);
  const duplicate = reports.find(
    (r) =>
      dedupeKey(r) === key &&
      now - r.createdAt < DUPLICATE_WINDOW_MS,
  );
  if (duplicate) {
    return { ok: true, reportId: duplicate.id, duplicate: true };
  }

  const report: StoredModerationReport = {
    id: `mod-${randomUUID()}`,
    reporterUserId: input.reporterUserId,
    targetType: input.targetType,
    targetId,
    targetOwnerUserId: input.targetOwnerUserId?.trim() || null,
    reason: reason.slice(0, 120),
    optionalNote: input.optionalNote?.trim().slice(0, 2000) || null,
    createdAt: now,
    status: 'submitted',
    visibilityContext: input.visibilityContext?.trim().slice(0, 120) || null,
    provenanceIds: (input.provenanceIds ?? []).filter((id) => typeof id === 'string').slice(0, 32),
  };

  reports.push(report);
  persistAccountDatabase();
  return { ok: true, reportId: report.id, duplicate: false };
}

/** Operator-only shape — reporter id included for internal review, not exposed to reported users. */
export function listModerationReportsForOperator(): StoredModerationReport[] {
  return dbReports().slice().sort((a, b) => b.createdAt - a.createdAt);
}
