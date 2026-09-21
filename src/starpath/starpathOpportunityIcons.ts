import type { OpportunityType } from '@/starpath/starpathOpportunityTypes';

export function iconForOpportunityType(type: OpportunityType): string {
  switch (type) {
    case 'event':
    case 'networking':
      return '◷';
    case 'grant':
    case 'funding':
      return '✧';
    case 'workshop':
    case 'class':
    case 'course':
      return '◫';
    case 'audition':
      return '✴';
    case 'community_program':
    case 'volunteer':
      return '⚭';
    case 'mentor':
      return '◎';
    case 'venue':
    case 'space':
      return '⌂';
    case 'app_tool':
      return '◈';
    default:
      return '◇';
  }
}

export function ringColorForBranch(branchId: string): string {
  switch (branchId) {
    case 'learning':
      return '#5EC8FF';
    case 'relationships':
      return '#E879A8';
    case 'growth':
      return '#7EE8A8';
    case 'community':
      return '#B794F6';
    default:
      return '#E8C872';
  }
}
