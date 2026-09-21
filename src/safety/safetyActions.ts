import AsyncStorage from '@react-native-async-storage/async-storage';

const REPORTS_KEY = '@reellyou/safety-reports-local';

export type SafetyReportReason = 'harassment' | 'spam' | 'other';

export interface LocalSafetyReport {
  id: string;
  reportedUserId: string;
  threadId?: string;
  reason: SafetyReportReason;
  createdAt: number;
  /** LOCAL queue only — not sent to a live backend in Beta. */
  status: 'queued_local';
}

export interface SafetyReportResult {
  ok: boolean;
  localOnly: true;
  reportId: string;
}

/** Canonical Beta report action — persists locally until backend exists. */
export async function reportUserSafety(params: {
  reportedUserId: string;
  threadId?: string;
  reason?: SafetyReportReason;
}): Promise<SafetyReportResult> {
  const report: LocalSafetyReport = {
    id: `report-${params.reportedUserId}-${Date.now()}`,
    reportedUserId: params.reportedUserId,
    threadId: params.threadId,
    reason: params.reason ?? 'other',
    createdAt: Date.now(),
    status: 'queued_local',
  };
  try {
    const raw = await AsyncStorage.getItem(REPORTS_KEY);
    const list = raw ? (JSON.parse(raw) as LocalSafetyReport[]) : [];
    list.push(report);
    await AsyncStorage.setItem(REPORTS_KEY, JSON.stringify(list.slice(-50)));
  } catch {
    /* still return queued id for UX continuity */
  }
  return { ok: true, localOnly: true, reportId: report.id };
}
