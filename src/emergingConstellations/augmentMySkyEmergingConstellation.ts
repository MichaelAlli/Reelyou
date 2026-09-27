import {
  devEmergingConstellationIfEligible,
  resolveEmergingConstellationById,
} from '@/emergingConstellations/emergingConstellationFixtures';
import type { SkyPattern } from '@/mySky/skyNodeTypes';
import type { MySkyView } from '@/mySky/types';

function pickDonorPattern(patterns: SkyPattern[]): SkyPattern | null {
  const growth = patterns.find((entry) => entry.id === 'pattern-growth-journey');
  if (growth && growth.nodeIds.length >= 2) return growth;

  const emerging = patterns
    .filter((entry) => entry.status === 'emerging' && entry.nodeIds.length >= 2)
    .sort((a, b) => b.nodeIds.length - a.nodeIds.length)[0];
  if (emerging) return emerging;

  return (
    patterns
      .filter((entry) => entry.nodeIds.length >= 2)
      .sort((a, b) => b.nodeIds.length - a.nodeIds.length)[0] ?? null
  );
}

/**
 * Tag an existing sky pattern with the canonical Emerging Group id — no new nodes or geometry.
 */
export function augmentMySkyEmergingConstellation(
  view: MySkyView,
  emergingCommunityId: string | null,
): MySkyView {
  if (!emergingCommunityId) return view;
  if (!devEmergingConstellationIfEligible()) return view;

  const alreadyTagged = view.patterns.find(
    (pattern) => pattern.emergingCommunityId === emergingCommunityId,
  );
  if (alreadyTagged) return view;

  const donor = pickDonorPattern(view.patterns);
  if (!donor) return view;

  const constellation = resolveEmergingConstellationById(emergingCommunityId);
  const patterns = view.patterns.map((pattern) =>
    pattern.id === donor.id
      ? {
          ...pattern,
          emergingCommunityId,
          label: constellation?.name ?? pattern.label,
          note: constellation?.sharedTheme ?? pattern.note,
        }
      : pattern,
  );

  return { ...view, patterns };
}
