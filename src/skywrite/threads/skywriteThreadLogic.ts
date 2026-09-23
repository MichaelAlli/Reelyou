import {
  contributionIdForResponse,
  type ContributionRecord,
} from '@/contributions/contributionTypes';
import type { SkywriteResponseRecord, SkywriteThreadState } from '@/skywrite/threads/skywriteThreadTypes';
import { threadIdForSkywrite } from '@/skywrite/threads/skywriteThreadTypes';

function nowMs(): number {
  return Date.now();
}

export function responsesForSkywrite(
  state: SkywriteThreadState,
  skywriteId: string,
): SkywriteResponseRecord[] {
  return state.responses
    .filter((entry) => entry.skywriteId === skywriteId)
    .sort((a, b) => a.createdAt - b.createdAt);
}

export function addSkywriteResponse(
  state: SkywriteThreadState,
  params: {
    skywriteId: string;
    responderId: string;
    body: string;
    responseId?: string;
  },
): { state: SkywriteThreadState; response: SkywriteResponseRecord } {
  const trimmed = params.body.trim();
  const ts = nowMs();
  const response: SkywriteResponseRecord = {
    responseId: params.responseId ?? `resp-${params.skywriteId}-${ts}`,
    skywriteId: params.skywriteId,
    threadId: threadIdForSkywrite(params.skywriteId),
    responderId: params.responderId,
    body: trimmed,
    createdAt: ts,
    visibility: 'public',
    savedByAuthor: false,
    savedAt: null,
  };
  return {
    state: {
      ...state,
      responses: [...state.responses, response],
      beaconEngagementBySkywriteId: {
        ...state.beaconEngagementBySkywriteId,
        [params.skywriteId]: 'responded',
      },
      updatedAt: ts,
    },
    response,
  };
}

export function markBeaconIgnored(
  state: SkywriteThreadState,
  skywriteId: string,
): SkywriteThreadState {
  const ts = nowMs();
  return {
    ...state,
    beaconEngagementBySkywriteId: {
      ...state.beaconEngagementBySkywriteId,
      [skywriteId]: 'ignored',
    },
    updatedAt: ts,
  };
}

export function authorSaveResponse(
  state: SkywriteThreadState,
  skywriteId: string,
  responseId: string,
  skyAreaId: string,
  authorId: string,
  contributions: ContributionRecord[],
): {
  state: SkywriteThreadState;
  contributions: ContributionRecord[];
  contribution: ContributionRecord | null;
} {
  const response = state.responses.find(
    (entry) => entry.skywriteId === skywriteId && entry.responseId === responseId,
  );
  if (!response || response.responderId === authorId) {
    return { state, contributions, contribution: null };
  }

  const ts = nowMs();
  const nextResponses = state.responses.map((entry) =>
    entry.responseId === responseId
      ? { ...entry, savedByAuthor: true, savedAt: ts }
      : entry,
  );

  const contributionId = contributionIdForResponse(skywriteId, responseId);
  const existing = contributions.find((entry) => entry.contributionId === contributionId);

  let nextContributions = contributions;
  let contribution: ContributionRecord | null = null;

  if (existing?.state === 'active') {
    contribution = existing;
  } else {
    const record: ContributionRecord = {
      contributionId,
      responderId: response.responderId,
      sourceSkywriteId: skywriteId,
      sourceThreadId: threadIdForSkywrite(skywriteId),
      sourceResponseId: responseId,
      skyAreaId,
      contributionType: 'skywrite_response',
      state: 'active',
      createdAt: existing?.createdAt ?? ts,
      savedAt: ts,
      withdrawnAt: undefined,
    };
    nextContributions = existing
      ? contributions.map((entry) =>
          entry.contributionId === contributionId ? record : entry,
        )
      : [...contributions, record];
    contribution = record;
  }

  return {
    state: {
      ...state,
      responses: nextResponses,
      updatedAt: ts,
    },
    contributions: nextContributions,
    contribution,
  };
}

export function authorUnsaveResponse(
  state: SkywriteThreadState,
  skywriteId: string,
  responseId: string,
  contributions: ContributionRecord[],
): {
  state: SkywriteThreadState;
  contributions: ContributionRecord[];
} {
  const ts = nowMs();
  const contributionId = contributionIdForResponse(skywriteId, responseId);
  const nextResponses = state.responses.map((entry) =>
    entry.responseId === responseId
      ? { ...entry, savedByAuthor: false, savedAt: null }
      : entry,
  );
  const nextContributions = contributions.map((entry) =>
    entry.contributionId === contributionId && entry.state === 'active'
      ? { ...entry, state: 'withdrawn' as const, withdrawnAt: ts }
      : entry,
  );
  return {
    state: {
      ...state,
      responses: nextResponses,
      updatedAt: ts,
    },
    contributions: nextContributions,
  };
}
