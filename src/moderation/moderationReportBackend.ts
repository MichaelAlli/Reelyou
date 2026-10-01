import { authenticatedReellyouFetch } from '@/backend/authenticatedReellyouFetch';
import { resolveAuthApiBaseUrl } from '@/auth/reellyouAuthConfig';
import type { SubmitModerationReportInput } from '@/moderation/moderationTypes';

export async function submitModerationReportToBackend(
  input: SubmitModerationReportInput,
): Promise<{ ok: true; reportId: string; duplicate?: boolean } | { ok: false; error: string }> {
  const base = resolveAuthApiBaseUrl();
  if (!base) return { ok: false, error: 'auth_not_configured' };

  const res = await authenticatedReellyouFetch('/v1/moderation/reports', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      targetType: input.targetType,
      targetId: input.targetId,
      targetOwnerUserId: input.targetOwnerUserId,
      reason: input.reason,
      optionalNote: input.optionalNote,
      visibilityContext: input.visibilityContext,
      provenanceIds: input.provenanceIds,
    }),
  });

  const body = (await res.json()) as {
    ok?: boolean;
    reportId?: string;
    duplicate?: boolean;
    error?: string;
  };
  if (!res.ok || !body.ok || !body.reportId) {
    return { ok: false, error: body.error ?? 'submit_failed' };
  }
  return { ok: true, reportId: body.reportId, duplicate: body.duplicate };
}
