export interface CommentResponseDTO {
  commentId: number;
  postId: number;
  authorId: number;
  parentCommentId?: number;
  content: string;
  status: string;
  likesCount: number;
  createdAt: string;
  updatedAt: string;
}
