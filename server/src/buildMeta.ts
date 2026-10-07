export const API_SERVICE_NAME = 'reellyou-api';
export const API_RUNTIME_ENTRY = 'src/index.ts';

export function resolveBuildIdentifier(): string {
  return (
    process.env.RENDER_GIT_COMMIT?.trim() ||
    process.env.BUILD_COMMIT?.trim() ||
    process.env.GIT_COMMIT?.trim() ||
    'unknown'
  );
}
