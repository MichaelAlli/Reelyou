import type { SkywriteRecord } from '@/skywrite/types';

/** True when the post still has user-visible body or media (not lifecycle-stripped). */
export function hasRenderableSkywriteContent(post: SkywriteRecord): boolean {
  return (
    Boolean(post.text?.trim()) ||
    Boolean(post.media.photo?.uri || post.media.photo?.remoteAssetId) ||
    Boolean(post.media.video?.uri || post.media.video?.remoteAssetId) ||
    Boolean(post.media.audio?.uri || post.media.audio?.remoteAssetId)
  );
}

export function filterRenderableSkywrites(posts: readonly SkywriteRecord[]): SkywriteRecord[] {
  return posts.filter(hasRenderableSkywriteContent);
}
