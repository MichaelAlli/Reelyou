import type { GuidePreferences } from '@/preferences/userPreferencesTypes';
import type { StarPathGuidanceOutput } from '@/starpath/starpathGuidanceEngine';
import { guideBodyForType, nextStepTitleForType } from '@/starpath/starpathGuidanceCopy';

export function applyGuidePreferences(
  output: StarPathGuidanceOutput,
  prefs: GuidePreferences,
): StarPathGuidanceOutput {
  if (prefs.mode === 'off') {
    return {
      ...output,
      guide: {
        messageId: 'guide-peace-off',
        type: 'peace_state',
        body: guideBodyForType('peace_state'),
        reasonCodes: ['peace'],
        sourceIds: [],
      },
      nextStep: {
        stepId: 'step-no_step-off',
        type: 'no_step',
        ...nextStepTitleForType('no_step'),
        sourceIds: [],
      },
    };
  }

  let guide = output.guide;
  if (guide && prefs.mode === 'reduced') {
    const allowed = guide.type === 'peace_state' || guide.type === 'time_sensitive_opportunity';
    if (!allowed) guide = null;
  }
  if (guide && !prefs.opportunityNudges) {
    if (
      guide.type === 'opportunity_notice' ||
      guide.type === 'undiscovered_opportunity'
    ) {
      guide = null;
    }
  }
  if (guide && !prefs.timeSensitiveGuidance && guide.type === 'time_sensitive_opportunity') {
    guide = null;
  }
  if (guide && !prefs.reflectionPrompts && guide.type === 'reflection_prompt') {
    guide = null;
  }

  return { ...output, guide };
}
