import type { SkywritesState } from '@/skywrite/types';

/** One-time legacy global → scoped bucket: keep posts, align owner id (do not drop mock-era author ids). */
export function migrateSkywritesForUser(state: SkywritesState, userId: string): SkywritesState {
  return {
    posts: state.posts.map((post) => ({
      ...post,
      authorId: post.authorId === userId ? post.authorId : userId,
    })),
  };
}
