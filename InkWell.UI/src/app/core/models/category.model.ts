export interface CategoryResponseDTO {
  categoryId: number;
  name: string;
  slug: string;
  description: string;
  parentCategoryId?: number;
  postCount: number;
  createdAt: string;
}

export interface TagResponseDTO {
  tagId: number;
  name: string;
  slug: string;
  postCount: number;
  createdAt: string;
}
