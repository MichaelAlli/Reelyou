import { withQaPreviewHref } from '@/qa/qaPreviewRoutes';

/** Keep qaPreview/qaState when alias routes Redirect to another path (auth guard depends on query). */
export function preserveQaPreviewRedirectHref(
  targetPath: string,
  options?: { qaPreviewActive?: boolean; qaState?: string | null },
): string {
  if (!options?.qaPreviewActive) return targetPath;
  return withQaPreviewHref(
    targetPath,
    options.qaState ? { qaState: options.qaState as 'empty' | 'loading' | 'error' | 'populated' } : undefined,
  );
}
