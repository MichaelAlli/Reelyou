import type { ContributionRecord } from '@/contributions/contributionTypes';
import { RippleCopy } from '@/constants/rippleCopy';
import { deriveImpactEventCount } from '@/humanPotential/humanPotentialMetricsEngine';
import type { HumanPotentialMetricsState } from '@/humanPotential/humanPotentialMetricsState';
import type { ImpactEventRecord } from '@/humanPotential/humanPotentialModels';
import {
  canViewerSeeContribution,
  canViewerSeeImpactItem,
  privacySafePersonLabel,
  type LegacyViewerContext,
} from '@/legacy/legacyViewerAccess';
import type { SkywriteRecord } from '@/skywrite/types';

export type RippleMetricDetailKind =
  | 'lives'
  | 'contributions'
  | 'encouragementsGiven'
  | 'encouragementsReceived';

export interface RippleMetricDetailRow {
  id: string;
  title: string;
  subtitle?: string;
  meta?: string;
  personUserId?: string;
}

export interface RippleMetricDetailView {
  kind: RippleMetricDetailKind;
  title: string;
  emptyTitle: string;
  emptyBody: string;
  rows: RippleMetricDetailRow[];
}

function formatDate(ms: number): string {
  try {
    return new Date(ms).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return '';
  }
}

function areaLabel(skyAreaId?: string): string | undefined {
  if (!skyAreaId) return undefined;
  return skyAreaId.replace(/-/g, ' ');
}

export function buildRippleMetricDetailView(input: {
  kind: RippleMetricDetailKind;
  ownerUserId: string;
  metrics: HumanPotentialMetricsState;
  contributions: readonly ContributionRecord[];
  userDirectory: Readonly<Record<string, string>>;
  blockedUserIds: readonly string[];
  mode?: 'owner' | 'visitor';
  viewerContext?: LegacyViewerContext;
  skywrites?: readonly SkywriteRecord[];
}): RippleMetricDetailView {
  const {
    kind,
    ownerUserId,
    metrics,
    contributions,
    userDirectory,
    blockedUserIds,
    mode = 'owner',
    viewerContext,
    skywrites = [],
  } = input;
  const isVisitor = mode === 'visitor' && viewerContext != null;

  if (kind === 'lives') {
    const relationships = metrics.uniqueImpactRelationships
      .filter(
        (rel) =>
          rel.active &&
          rel.contributorUserId === ownerUserId &&
          !blockedUserIds.includes(rel.impactedUserId),
      )
      .sort((a, b) => b.impactEventCount - a.impactEventCount || b.latestConfirmedAt - a.latestConfirmedAt);

    const rows: RippleMetricDetailRow[] = [];
    for (const rel of relationships) {
      const events = metrics.impactEvents
        .filter(
          (event) =>
            event.contributorUserId === ownerUserId &&
            event.impactedUserId === rel.impactedUserId &&
            event.userConfirmed,
        )
        .sort((a, b) => a.createdAt - b.createdAt);
      const visibleEvents = isVisitor
        ? events.filter((event) => canViewerSeeImpactItem(event, viewerContext, skywrites))
        : events;
      if (isVisitor && visibleEvents.length === 0) continue;
      const name = userDirectory[rel.impactedUserId];
      if (!isVisitor && !name) continue;
      const first = visibleEvents[0] ?? events[0];
      const depth = deriveImpactEventCount(ownerUserId, rel.impactedUserId, metrics);
      const showIdentity = !isVisitor || Boolean(name);
      rows.push({
        id: rel.impactRelationshipId,
        personUserId: isVisitor ? undefined : rel.impactedUserId,
        title: isVisitor
          ? privacySafePersonLabel(rel.impactedUserId, userDirectory, showIdentity)
          : (name ?? 'Someone'),
        subtitle: first?.context?.trim() || 'Confirmed meaningful impact',
        meta: `${depth} meaningful moment${depth === 1 ? '' : 's'} · since ${formatDate(rel.firstConfirmedAt)}${
          areaLabel(first?.skyAreaId) ? ` · ${areaLabel(first?.skyAreaId)}` : ''
        }`,
      });
    }

    return {
      kind,
      title: RippleCopy.metricLives,
      emptyTitle: isVisitor ? 'No shared impact details yet.' : 'No lives impacted yet',
      emptyBody: isVisitor
        ? 'When they share meaningful impact with you, it will appear here.'
        : 'Your meaningful impact will appear here as people confirm how something you shared helped them.',
      rows,
    };
  }

  if (kind === 'contributions') {
    const rows = contributions
      .filter((entry) => entry.responderId === ownerUserId && entry.state === 'active')
      .filter(
        (entry) =>
          !isVisitor || canViewerSeeContribution(entry, viewerContext, skywrites),
      )
      .sort((a, b) => b.createdAt - a.createdAt)
      .map((entry) => {
        const impactForContribution = metrics.impactEvents.find(
          (event) => event.sourceContributionId === entry.contributionId && event.userConfirmed,
        );
        const recipientId = impactForContribution?.impactedUserId;
        const recipient = recipientId ? userDirectory[recipientId]?.split(' ')[0] : undefined;
        const ledToImpact = Boolean(impactForContribution);
        const ledToApplication = metrics.applicationEvidence.some(
          (app) => app.contributionId === entry.contributionId && app.userConfirmed,
        );
        const ledToRipple = metrics.rippleEvents.some(
          (ripple) => ripple.parentContributionId === entry.contributionId && ripple.userConfirmed,
        );
        const progression = [
          ledToApplication ? 'Application' : null,
          ledToImpact ? 'Impact' : null,
          ledToRipple ? 'Ripple' : null,
        ]
          .filter(Boolean)
          .join(' → ');
        return {
          id: entry.contributionId,
          title: isVisitor
            ? recipient
              ? `Shared support · ${recipient}`
              : 'Shared contribution'
            : recipient
              ? `For ${recipient}`
              : 'Thoughtful contribution',
          subtitle: `Saved response · ${areaLabel(entry.skyAreaId) ?? 'Sky'}`,
          meta: `${formatDate(entry.createdAt)}${progression ? ` · ${progression}` : ''}`,
          personUserId: isVisitor ? undefined : recipientId,
        };
      });

    return {
      kind,
      title: RippleCopy.metricContributions,
      emptyTitle: isVisitor ? 'No shared contributions yet.' : 'No contributions yet',
      emptyBody: isVisitor
        ? 'Public contributions they have shared will appear here.'
        : 'Your meaningful contributions will gather here over time.',
      rows,
    };
  }

  if (kind === 'encouragementsGiven') {
    const rows = buildEncouragementRows(
      metrics.impactEvents.filter(
        (event) => event.contributorUserId === ownerUserId && event.userConfirmed,
      ),
      userDirectory,
      blockedUserIds,
      'impactedUserId',
    );
    return {
      kind,
      title: RippleCopy.metricEncouragementsGiven,
      emptyTitle: 'No encouragements given yet',
      emptyBody: 'The moments where your support helped someone will appear here.',
      rows,
    };
  }

  const rows = buildEncouragementRows(
    metrics.impactEvents.filter(
      (event) => event.impactedUserId === ownerUserId && event.userConfirmed,
    ),
    userDirectory,
    blockedUserIds,
    'contributorUserId',
  );
  return {
    kind,
    title: RippleCopy.metricEncouragementsReceived,
    emptyTitle: 'No encouragements received yet',
    emptyBody:
      'The people who helped you feel supported, understood, or less alone will appear here.',
    rows,
  };
}

function buildEncouragementRows(
  events: ImpactEventRecord[],
  userDirectory: Readonly<Record<string, string>>,
  blockedUserIds: readonly string[],
  personKey: 'impactedUserId' | 'contributorUserId',
): RippleMetricDetailRow[] {
  return events
    .filter((event) => !blockedUserIds.includes(event[personKey]))
    .sort((a, b) => b.createdAt - a.createdAt)
    .map((event) => {
      const personId = event[personKey];
      const name = userDirectory[personId] ?? RippleCopy.privacyHiddenName;
      return {
        id: event.impactEventId,
        personUserId: personId,
        title: name,
        subtitle: event.context?.trim() || 'Meaningful support confirmed',
        meta: formatDate(event.createdAt) + (areaLabel(event.skyAreaId) ? ` · ${areaLabel(event.skyAreaId)}` : ''),
      };
    });
}
