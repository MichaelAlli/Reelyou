import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import type { ContributionRecord } from '@/contributions/contributionTypes';
import type { HumanPotentialEvidenceType } from '@/humanPotential/humanPotentialEvidenceTypes';
import {
  loadHumanPotentialMetricsState,
  saveHumanPotentialMetricsState,
} from '@/humanPotential/humanPotentialPersistence';
import {
  addApplicationEvidence,
  addLearningEvidence,
  confirmImpactEvent,
  deriveImpactEventCount,
  deriveLivesImpacted,
  resolveImpactParties,
} from '@/humanPotential/humanPotentialMetricsEngine';
import {
  EMPTY_HUMAN_POTENTIAL_METRICS_STATE,
  type HumanPotentialMetricsState,
} from '@/humanPotential/humanPotentialMetricsState';
import { currentUser } from '@/data/mockData';
import type { ThreadReflectionRecord } from '@/skywrite/savedThreads/savedThreadTypes';

interface ConfirmGrowthInput {
  evidenceType: HumanPotentialEvidenceType;
  reflection: ThreadReflectionRecord;
  savedThreadId: string;
  sourceSkywriteId: string;
  sourceThreadId?: string;
  originalAuthorId: string;
  contributions: readonly ContributionRecord[];
  skyAreaId?: string;
}

interface HumanPotentialMetricsContextValue {
  isLoaded: boolean;
  state: HumanPotentialMetricsState;
  confirmGrowthEvidence: (input: ConfirmGrowthInput) => void;
  livesImpactedFor: (contributorUserId: string) => number;
  impactEventsForPair: (contributorUserId: string, impactedUserId: string) => number;
}

const HumanPotentialMetricsContext = createContext<HumanPotentialMetricsContextValue | null>(null);

export function HumanPotentialMetricsProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<HumanPotentialMetricsState>(EMPTY_HUMAN_POTENTIAL_METRICS_STATE);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    let mounted = true;
    void loadHumanPotentialMetricsState().then((loaded) => {
      if (!mounted) return;
      setState(loaded);
      setIsLoaded(true);
    });
    return () => {
      mounted = false;
    };
  }, []);

  const persist = useCallback((next: HumanPotentialMetricsState) => {
    setState(next);
    void saveHumanPotentialMetricsState(next);
  }, []);

  const confirmGrowthEvidence = useCallback(
    (input: ConfirmGrowthInput) => {
      const parties = resolveImpactParties({
        viewerId: currentUser.id,
        originalAuthorId: input.originalAuthorId,
        skywriteId: input.sourceSkywriteId,
        contributions: input.contributions,
        sourceResponseId: input.reflection.sourceResponseId,
      });

      if (input.evidenceType === 'learning') {
        persist(
          addLearningEvidence({
            state,
            userId: currentUser.id,
            reflection: input.reflection,
            savedThreadId: input.savedThreadId,
            sourceSkywriteId: input.sourceSkywriteId,
            sourceResponseId: input.reflection.sourceResponseId,
            contributionId: input.reflection.sourceContributionId,
          }),
        );
        return;
      }

      if (input.evidenceType === 'application') {
        persist(
          addApplicationEvidence({
            state,
            userId: currentUser.id,
            reflection: input.reflection,
            savedThreadId: input.savedThreadId,
            sourceSkywriteId: input.sourceSkywriteId,
            sourceThreadId: input.sourceThreadId,
            sourceResponseId: input.reflection.sourceResponseId,
            contributionId: input.reflection.sourceContributionId,
          }),
        );
        return;
      }

      if (input.evidenceType === 'impact') {
        if (!parties) return;
        const result = confirmImpactEvent({
          state,
          contributorUserId: parties.contributorUserId,
          impactedUserId: parties.impactedUserId,
          reflection: input.reflection,
          savedThreadId: input.savedThreadId,
          sourceSkywriteId: input.sourceSkywriteId,
          sourceThreadId: input.sourceThreadId,
          sourceResponseId: input.reflection.sourceResponseId,
          contributionId: input.reflection.sourceContributionId,
          skyAreaId: input.skyAreaId,
        });
        persist(result.state);
      }
    },
    [persist, state],
  );

  const livesImpactedFor = useCallback(
    (contributorUserId: string) => deriveLivesImpacted(contributorUserId, state),
    [state],
  );

  const impactEventsForPair = useCallback(
    (contributorUserId: string, impactedUserId: string) =>
      deriveImpactEventCount(contributorUserId, impactedUserId, state),
    [state],
  );

  const value = useMemo<HumanPotentialMetricsContextValue>(
    () => ({
      isLoaded,
      state,
      confirmGrowthEvidence,
      livesImpactedFor,
      impactEventsForPair,
    }),
    [confirmGrowthEvidence, impactEventsForPair, isLoaded, livesImpactedFor, state],
  );

  return (
    <HumanPotentialMetricsContext.Provider value={value}>{children}</HumanPotentialMetricsContext.Provider>
  );
}

export function useHumanPotentialMetrics(): HumanPotentialMetricsContextValue {
  const ctx = useContext(HumanPotentialMetricsContext);
  if (!ctx) {
    throw new Error('useHumanPotentialMetrics must be used within HumanPotentialMetricsProvider');
  }
  return ctx;
}
