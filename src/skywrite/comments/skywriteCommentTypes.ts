export type SkywriteCommentStarterKind = 'encourage' | 'relate' | 'idea';

export interface SkywriteCommentRecord {
  commentId: string;
  skywriteId: string;
  authorId: string;
  body: string;
  createdAt: number;
  updatedAt: number;
  starterKind?: SkywriteCommentStarterKind;
  clientRequestId?: string;
}

export interface SkywriteCommentState {
  comments: SkywriteCommentRecord[];
  updatedAt: number;
}

export const EMPTY_SKYWRITE_COMMENT_STATE: SkywriteCommentState = {
  comments: [],
  updatedAt: 0,
};
