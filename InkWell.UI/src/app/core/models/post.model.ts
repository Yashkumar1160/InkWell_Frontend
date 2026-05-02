export interface Post {
  postId: number;
  authorId: number;
  authorName: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  featuredImageUrl: string;
  status: string;
  readTimeMinutes: number;
  viewCount: number;
  likesCount: number;
  isFeatured: boolean;
  isLiked?: boolean;
  createdAt: string;
  publishedAt?: string;
}
