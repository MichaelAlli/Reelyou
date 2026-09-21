import type { StarPathGuideMessageType, StarPathGuideReasonCode } from '@/starpath/starpathGuidanceTypes';

export function guideBodyForType(type: StarPathGuideMessageType): string {
  switch (type) {
    case 'emergence_notice':
      return 'A new possibility opened nearby.';
    case 'revisit_saved':
      return 'You saved this earlier. Want to revisit it?';
    case 'continue_exploration':
      return 'Want to explore what connects these?';
    case 'branch_connection':
      return 'These two paths connect around something you’ve explored.';
    case 'reflection_prompt':
      return 'A quiet reflection might help this part of your path settle.';
    case 'milestone_acknowledgement':
      return 'This part of your journey has started to take shape.';
    case 'focus_alignment':
      return 'This may connect with today’s focus.';
    case 'opportunity_notice':
      return 'Something useful appeared along your path.';
    case 'time_sensitive_opportunity':
      return 'There’s a resource here with an upcoming deadline you may want to review.';
    case 'undiscovered_opportunity':
      return 'There’s something along this path you haven’t opened yet that may be worth seeing.';
    case 'peace_state':
      return 'Nothing needs your attention right now.';
    default:
      return 'Guidance for this stretch of your Starpath.';
  }
}

export function whyThisLinesForReasons(codes: StarPathGuideReasonCode[]): string[] {
  const lines: string[] = [];
  for (const code of codes) {
    switch (code) {
      case 'marked_interesting':
        lines.push('You marked this as interesting.');
        break;
      case 'explored_related':
        lines.push('You explored related paths recently.');
        break;
      case 'saved_connected':
        lines.push('You saved something connected to this.');
        break;
      case 'new_possibility':
        lines.push('Something new became visible on your path.');
        break;
      case 'branch_pattern':
        lines.push('You’ve spent meaningful time on this branch lately.');
        break;
      case 'focus_alignment':
        lines.push('This connects to your current focus.');
        break;
      case 'milestone_shape':
        lines.push('Your recent steps here are starting to form a pattern.');
        break;
      case 'peace':
        lines.push('Your path is clear right now.');
        break;
      case 'upcoming_deadline':
        lines.push('This opportunity has an upcoming deadline.');
        break;
      case 'undiscovered_along_path':
        lines.push('This has been waiting on a path you’ve returned to.');
        break;
      default:
        break;
    }
  }
  return [...new Set(lines)];
}

export function nextStepTitleForType(
  type: import('@/starpath/starpathGuidanceTypes').StarPathNextStepType,
): { title: string; actionLabel: string } {
  switch (type) {
    case 'explore_new_node':
      return { title: 'Explore this possibility', actionLabel: 'Stay on path' };
    case 'revisit_saved':
      return { title: 'Revisit what you saved', actionLabel: 'Review saved' };
    case 'continue_branch':
      return { title: 'Continue this path', actionLabel: 'Next small step' };
    case 'reflect':
      return { title: 'Reflect on what changed', actionLabel: 'Open Skywrite' };
    case 'view_connection':
      return { title: 'See what connects here', actionLabel: 'Stay on path' };
    case 'review_milestone':
      return { title: 'Review this part of your journey', actionLabel: 'Next small step' };
    case 'review_opportunity':
      return { title: 'Review this opportunity', actionLabel: 'Stay on path' };
    case 'no_step':
    default:
      return { title: 'Share a reflection', actionLabel: 'Open Skywrite' };
  }
}
