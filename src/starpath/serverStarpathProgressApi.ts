import { authenticatedReellyouFetch } from '@/backend/authenticatedReellyouFetch';
import { isReelyouAuthConfigured } from '@/auth/reellyouAuthConfig';
import type { ServerJourneyStarpathSignals } from '@/journey/applyJourneyAiSignals';
import type { StarPathResourceState } from '@/starpath/starpathOpportunityTypes';
import type { UserSupportState } from '@/starpath/starpathEmotionalContextTypes';

export interface ServerStarpathProgressSnapshot {
  resources: Pick<
    StarPathResourceState,
    'savedResourceIds' | 'dismissedResourceIds' | 'snoozedResourceUntil'
  >;
  settledMilestoneIds: string[];
  emotional: { supportState: UserSupportState; userReportedLabel?: string | null } | null;
}

export async function fetchStarpathProgressFromServer(): Promise<ServerStarpathProgressSnapshot | null> {
  if (!isReelyouAuthConfigured()) return null;
  const res = await authenticatedReellyouFetch('/v1/starpath/progress/me', { method: 'GET' });
  if (!res?.ok) return null;
  const body = (await res.json()) as {
    ok?: boolean;
    snapshot?: ServerStarpathProgressSnapshot & { version?: number; updatedAt?: number };
  };
  if (body.ok !== true || !body.snapshot) return null;
  return {
    resources: {
      savedResourceIds: body.snapshot.resources?.savedResourceIds ?? [],
      dismissedResourceIds: body.snapshot.resources?.dismissedResourceIds ?? [],
      snoozedResourceUntil: body.snapshot.resources?.snoozedResourceUntil ?? {},
    },
    settledMilestoneIds: body.snapshot.settledMilestoneIds ?? [],
    emotional: body.snapshot.emotional ?? null,
  };
}

export async function syncStarpathProgressToServer(payload: {
  resources?: ServerStarpathProgressSnapshot['resources'];
  settledMilestoneIds?: string[];
  emotional?: ServerStarpathProgressSnapshot['emotional'];
}): Promise<boolean> {
  if (!isReelyouAuthConfigured()) return false;
  const res = await authenticatedReellyouFetch('/v1/starpath/progress/me', {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
  if (!res?.ok) return false;
  const body = (await res.json()) as { ok?: boolean };
  return body.ok === true;
}

export async function fetchServerJourneyStarpathSignals(): Promise<{
  signals: ServerJourneyStarpathSignals | null;
  source: string | null;
  extractError: string | null;
}> {
  if (!isReelyouAuthConfigured()) {
    return { signals: null, source: null, extractError: 'auth_not_configured' };
  }
  const res = await authenticatedReellyouFetch('/v1/starpath/journey-signals/me', { method: 'GET' });
  if (!res?.ok) {
    return { signals: null, source: null, extractError: 'fetch_failed' };
  }
  const body = (await res.json()) as {
    ok?: boolean;
    source?: string;
    extractError?: string | null;
    signals?: ServerJourneyStarpathSignals & { sourceHash?: string; extractedAt?: number };
  };
  if (body.ok !== true || !body.signals) {
    return { signals: null, source: body.source ?? null, extractError: body.extractError ?? null };
  }
  const s = body.signals;
  return {
    signals: {
      explicitGoals: s.explicitGoals ?? [],
      explicitSkills: s.explicitSkills ?? [],
      currentActivities: s.currentActivities ?? [],
      statedChallenges: s.statedChallenges ?? [],
      tentativeInterests: s.tentativeInterests ?? [],
      resourceNeeds: s.resourceNeeds ?? [],
    },
    source: body.source ?? null,
    extractError: body.extractError ?? null,
  };
}
