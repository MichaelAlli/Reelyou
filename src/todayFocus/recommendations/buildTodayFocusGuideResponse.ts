import { EmotionAiCopy } from '@/constants/emotionAiCopy';
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
        ? EmotionAiCopy.focusGuideIntro
        : EmotionAiCopy.focusGuideIntroManual
      : EmotionAiCopy.focusEmptyPeace;

  const transparencyNote =
    recommendations.length > 0
      ? `${EmotionAiCopy.aiTransparencyShort} ${EmotionAiCopy.aiSuggestionControl}`
      : 'You don’t have to work through today alone — refine focus when you’re ready.';

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
    emptyState: recommendations.length === 0 ? EmotionAiCopy.focusEmptyPeace : undefined,
    refineFocusHint:
      recommendations.length < 2
        ? 'A clearer focus (for example, “Prepare for my interview”) can help Your Guide suggest what fits.'
        : undefined,
  };
}
