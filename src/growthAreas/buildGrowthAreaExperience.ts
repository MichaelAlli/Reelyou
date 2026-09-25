import type { SkywriteRecord } from '@/skywrite/types';
import type { ApplicationEvidenceRecord } from '@/humanPotential/humanPotentialModels';
import {
  getSkyAreaCategory,
  isSkyAreaCategoryId,
  type SkyAreaCategoryId,
} from '@/skyAreas/skyAreaCategory';

export interface GrowthAreaExperienceSection {
  id: string;
  title: string;
  body: string;
  meta?: string;
}

export interface GrowthAreaExperienceView {
  skyAreaId: SkyAreaCategoryId | string;
  title: string;
  subtitle: string;
  journey: GrowthAreaExperienceSection[];
  learning: GrowthAreaExperienceSection[];
  application: GrowthAreaExperienceSection[];
  reflections: GrowthAreaExperienceSection[];
  support: GrowthAreaExperienceSection[];
  starPathNote?: string;
  todayFocusNote?: string;
}

function areaMatches(recordAreaId: string | undefined, skyAreaId: string): boolean {
  if (!recordAreaId) return false;
  return recordAreaId === skyAreaId;
}

export function buildGrowthAreaExperience(input: {
  skyAreaId: SkyAreaCategoryId | string;
  skywrites: readonly SkywriteRecord[];
  applicationEvidence: readonly ApplicationEvidenceRecord[];
  todayFocusValue?: string | null;
  todayFocusSkyAreaId?: string | null;
}): GrowthAreaExperienceView {
  const category = getSkyAreaCategory(
    isSkyAreaCategoryId(input.skyAreaId) ? input.skyAreaId : 'growth',
  );
  const title = category.label;
  const subtitle = 'Where this part of your journey is taking shape.';

  const reflections = input.skywrites
    .filter((entry) => areaMatches(entry.skyAreaId, input.skyAreaId))
    .slice(0, 6)
    .map((entry) => ({
      id: entry.id,
      title: entry.text?.slice(0, 48).trim() || 'Reflection',
      body: entry.text?.trim() || 'A moment you captured in this area.',
      meta: entry.visibility === 'private' ? 'Private' : undefined,
    }));

  const application = input.applicationEvidence
    .filter((entry) => {
      if (!entry.userConfirmed) return false;
      const sw = input.skywrites.find((write) => write.id === entry.sourceSkywriteId);
      return sw ? areaMatches(sw.skyAreaId, input.skyAreaId) : false;
    })
    .slice(0, 5)
    .map((entry) => ({
      id: entry.applicationEvidenceId,
      title: 'Applied something meaningful',
      body: 'You confirmed applying what you learned here.',
      meta: new Date(entry.createdAt).toLocaleDateString(),
    }));

  const journey =
    reflections.length > 0
      ? reflections.slice(0, 3)
      : [
          {
            id: 'empty-journey',
            title: 'Your story is still opening',
            body: 'Skywrites and meaningful choices in this area will gather here over time.',
          },
        ];

  const learning =
    application.length > 0
      ? application.map((entry) => ({
          ...entry,
          title: 'Learning taking root',
          body: entry.body,
        }))
      : [
          {
            id: 'empty-learning',
            title: 'Learning will appear here',
            body: 'When you capture learning in this area, it will show without becoming a feed.',
          },
        ];

  const support: GrowthAreaExperienceSection[] = [
    {
      id: 'support-placeholder',
      title: 'Support & contribution',
      body: 'Encouragement and contributions tied to this area will appear when canonical evidence exists.',
    },
  ];

  const todayFocusNote =
    input.todayFocusValue &&
    (!input.todayFocusSkyAreaId || input.todayFocusSkyAreaId === input.skyAreaId)
      ? input.todayFocusValue
      : undefined;

  return {
    skyAreaId: input.skyAreaId,
    title,
    subtitle,
    journey,
    learning,
    application,
    reflections,
    support,
    starPathNote: undefined,
    todayFocusNote,
  };
}
