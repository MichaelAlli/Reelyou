import type {
  FocusRecommendation,
  FocusRecommendationUiItem,
  TodayFocusGuideResponse,
  TodayFocusSession,
} from '@/todayFocus/recommendations/focusRecommendationTypes';

const ACTION_LABELS: Record<FocusRecommendation['type'], string> = {
  saved_thread: 'Open saved thread',
  reflection: 'View reflection',
  skywrite: 'Open Skywrite',
  contribution: 'View contribution',
  learning: 'Review learning',
  application: 'Review application',
  starpath_step: 'Open StarPath',
  opportunity: 'View opportunity',
  connected_sky: 'View profile',
  community: 'Open community',
  legacy_moment: 'View Legacy',
  guide_prompt: 'Refine focus',
  internal_resource: 'Explore',
  external_resource: 'Open resource',
  emerging_constellation: 'Explore',
};

function toUiItem(rec: FocusRecommendation): FocusRecommendationUiItem {
  return {
    id: rec.id,
    type: rec.type,
    title: rec.title,
    summary: rec.summary,
    whyRelevant: rec.whyRelevant,
    actionLabel: ACTION_LABELS[rec.type] ?? 'Open',
    destination: rec.destination,
    visualHint: rec.visualHint,
    privacyScope: rec.privacyScope,
  };
}

export function buildTodayFocusGuideResponse(input: {
  session: TodayFocusSession;
  recommendations: FocusRecommendation[];
  aiAssisted: boolean;
}): TodayFocusGuideResponse {
  const recommendations = input.recommendations.map(toUiItem);
  const messageFromGuide =
    recommendations.length > 0
      ? input.aiAssisted
        ? 'Your Guide found a few things that may help with today’s focus.'
        : 'Here are a few REELYOU-native matches for what you chose today.'
      : 'No strong matches yet.';

  const transparencyNote =
    recommendations.length > 0
      ? 'Suggested from patterns in what you’ve shared and chosen. These are suggestions — you’re always in control.'
      : 'Try refining what would help most today.';

  return {
    focus: {
      id: input.session.id,
      text: input.session.text,
      source: input.session.source,
      activeDate: input.session.activeDate,
    },
    messageFromGuide,
    transparencyNote,
    recommendations,
    emptyState: recommendations.length === 0 ? 'No strong matches yet.' : undefined,
    refineFocusHint:
      recommendations.length < 2
        ? 'Refining your focus (for example, “Prepare for my sales interview”) can improve matches.'
        : undefined,
  };
}
