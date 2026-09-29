import { canViewSkywrite, type CanViewSkywriteInput } from '@/skywrite/access/canViewSkywrite';

/** Comments follow the same visibility and block rules as viewing the post. */
export function canCommentOnSkywrite(input: CanViewSkywriteInput): boolean {
  return canViewSkywrite(input);
}
