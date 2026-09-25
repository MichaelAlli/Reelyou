import AsyncStorage from '@react-native-async-storage/async-storage';

import { CREDIBLE_STEWARDSHIP_SAFETY_REASONS } from '@/moderation/moderationReasons';
import { registerModerationContentAction } from '@/moderation/moderationContentRegistry';
import { suggestModerationTriage } from '@/moderation/moderationTriage';
import type {
  ModerationReport,
  SubmitModerationReportInput,
  SubmitModerationReportResult,
} from '@/moderation/moderationTypes';

const REPORTS_KEY = '@reellyou/moderation-reports-v1';
const DUPLICATE_WINDOW_MS = 24 * 60 * 60 * 1000;

const stewardshipNegativeQueue: string[] = [];
let memoryReports: ModerationReport[] | null = null;

export function consumeStewardshipModerationNegativeTargets(): string[] {
  if (stewardshipNegativeQueue.length === 0) return [];
  return stewardshipNegativeQueue.splice(0, stewardshipNegativeQueue.length);
}

async function loadReports(): Promise<ModerationReport[]> {
  if (memoryReports) return memoryReports;
  try {
    const raw = await AsyncStorage.getItem(REPORTS_KEY);
    const parsed = raw ? (JSON.parse(raw) as ModerationReport[]) : [];
    memoryReports = parsed;
    return parsed;
  } catch {
    memoryReports = memoryReports ?? [];
    return memoryReports;
  }
}

async function saveReports(reports: ModerationReport[]): Promise<boolean> {
  memoryReports = reports.slice(-100);
  try {
    await AsyncStorage.setItem(REPORTS_KEY, JSON.stringify(memoryReports));
    return true;
  } catch {
    return memoryReports.length > 0;
  }
}

export function clearModerationReportsForTests(): void {
  memoryReports = [];
  stewardshipNegativeQueue.length = 0;
}

function reportDedupeKey(input: SubmitModerationReportInput): string {
  return `${input.reporterUserId}:${input.targetType}:${input.targetId}`;
}

function findRecentDuplicate(
  reports: ModerationReport[],
  input: SubmitModerationReportInput,
  now: number,
): ModerationReport | undefined {
  const key = reportDedupeKey(input);
  return reports.find(
    (entry) =>
      reportDedupeKey({
        reporterUserId: entry.reporterUserId,
        targetType: entry.targetType,
        targetId: entry.targetId,
        reason: entry.reason,
      }) === key &&
      now - entry.createdAt < DUPLICATE_WINDOW_MS,
  );
}

function queueStewardshipIfCredible(input: SubmitModerationReportInput): void {
  if (!input.targetOwnerUserId) return;
  if (!CREDIBLE_STEWARDSHIP_SAFETY_REASONS.has(input.reason)) return;
  if (!stewardshipNegativeQueue.includes(input.targetOwnerUserId)) {
    stewardshipNegativeQueue.push(input.targetOwnerUserId);
  }
}

/** Canonical Beta moderation report submission — single queue for all surfaces. */
export async function submitModerationReport(
  input: SubmitModerationReportInput,
): Promise<SubmitModerationReportResult> {
  const trimmedNote = input.optionalNote?.trim();
  const now = Date.now();
  const reports = await loadReports();
  const duplicate = findRecentDuplicate(reports, input, now);
  if (duplicate) {
    return { ok: true, localOnly: true, reportId: duplicate.id, duplicate: true };
  }

  const triage = suggestModerationTriage({
    reason: input.reason,
    optionalNote: trimmedNote,
  });

  const report: ModerationReport = {
    id: `mod-${input.targetType}-${input.targetId}-${now}`,
    reporterUserId: input.reporterUserId,
    targetType: input.targetType,
    targetId: input.targetId,
    targetOwnerUserId: input.targetOwnerUserId,
    reason: input.reason,
    optionalNote: trimmedNote || undefined,
    createdAt: now,
    visibilityContext: input.visibilityContext,
    provenanceIds: input.provenanceIds ?? [],
    status: 'submitted',
    moderationMetadata: {
      aiSuggestedSeverity: triage.suggestedSeverity,
      aiSuggestedCategory: triage.suggestedCategory,
    },
    threadId: input.threadId,
    messageId: input.messageId,
    communityId: input.communityId,
    postId: input.postId,
    replyId: input.replyId,
    skywriteId: input.skywriteId,
  };

  if (triage.suggestedSeverity === 'high') {
    report.status = 'under_review';
  }

  const saved = await saveReports([...reports, report]);
  if (!saved) {
    return { ok: false, localOnly: true, error: 'storage_failed' };
  }

  queueStewardshipIfCredible(input);

  return { ok: true, localOnly: true, reportId: report.id, duplicate: false };
}

/** Dev / review simulation — marks content removed without exposing internals in UI. */
export async function applyModerationRemovalForTarget(
  targetType: ModerationReport['targetType'],
  targetId: string,
  reportId: string,
): Promise<void> {
  await registerModerationContentAction(targetType, targetId, 'removed', reportId);
}

export async function listModerationReportsForDev(): Promise<ModerationReport[]> {
  return loadReports();
}
