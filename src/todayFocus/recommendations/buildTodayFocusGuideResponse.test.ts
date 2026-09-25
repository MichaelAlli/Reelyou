import { EmotionAiCopy } from '@/constants/emotionAiCopy';
import { buildTodayFocusGuideResponse } from '@/todayFocus/recommendations/buildTodayFocusGuideResponse';

function assert(condition: boolean, message: string) {
  if (!condition) throw new Error(message);
}

const session = {
  id: 'focus-1',
  text: 'Prepare for interview',
  source: 'user' as const,
  activeDate: '2026-01-01',
};

const empty = buildTodayFocusGuideResponse({
  session,
  recommendations: [],
  aiAssisted: true,
});
assert(empty.emptyState === EmotionAiCopy.focusEmptyPeace, 'peaceful empty state');
assert(!empty.messageFromGuide.includes('match'), 'no match language');

const guided = buildTodayFocusGuideResponse({
  session,
  recommendations: [
    {
      id: 'r1',
      type: 'reflection',
      title: 'Reflection',
      summary: 'Summary',
      whyRelevant: 'Because focus',
      actionLabel: 'Open',
      destination: '/today-focus',
      visualHint: 'leaf',
      privacyScope: 'owner_only',
    },
  ],
  aiAssisted: true,
});
assert(guided.transparencyNote.includes(EmotionAiCopy.aiTransparencyShort), 'transparency');

console.log('buildTodayFocusGuideResponse.test.ts — OK');
