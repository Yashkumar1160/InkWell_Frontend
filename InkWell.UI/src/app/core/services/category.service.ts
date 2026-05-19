import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, shareReplay, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CategoryResponseDTO, TagResponseDTO } from '../models/category.model';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private readonly apiUrl = `${environment.apiUrl}/api/category`;

  // Caching streams
  private categories$: Observable<CategoryResponseDTO[]> | null = null;
  private tags$: Observable<TagResponseDTO[]> | null = null;
  private trendingTags$: Observable<TagResponseDTO[]> | null = null;

  constructor(private http: HttpClient) { }

  private postCategoriesCache = new Map<number, Observable<CategoryResponseDTO[]>>();

  clearCache(): void {
    this.categories$ = null;
    this.tags$ = null;
    this.trendingTags$ = null;
    this.postCategoriesCache.clear();
  }

  // Categories
  getAllCategories(): Observable<CategoryResponseDTO[]> {
    if (!this.categories$) {
      this.categories$ = this.http.get<CategoryResponseDTO[]>(`${this.apiUrl}/all`).pipe(
        shareReplay(1)
      );
    }
    return this.categories$;
  }

  getCategoryById(id: number): Observable<CategoryResponseDTO> {
    return this.http.get<CategoryResponseDTO>(`${this.apiUrl}/${id}`);
  }

  createCategory(dto: any): Observable<CategoryResponseDTO> {
    return this.http.post<CategoryResponseDTO>(`${this.apiUrl}/create`, dto).pipe(
      tap(() => this.clearCache())
    );
  }

  updateCategory(id: number, dto: any): Observable<CategoryResponseDTO> {
    return this.http.put<CategoryResponseDTO>(`${this.apiUrl}/update/${id}`, dto).pipe(
      tap(() => this.clearCache())
    );
  }

  deleteCategory(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/delete/${id}`).pipe(
      tap(() => this.clearCache())
    );
  }

  // Tags
  getAllTags(): Observable<TagResponseDTO[]> {
    if (!this.tags$) {
      this.tags$ = this.http.get<TagResponseDTO[]>(`${this.apiUrl}/tag/all`).pipe(
        shareReplay(1)
      );
    }
    return this.tags$;
  }

  getTrendingTags(): Observable<TagResponseDTO[]> {
    if (!this.trendingTags$) {
      this.trendingTags$ = this.http.get<TagResponseDTO[]>(`${this.apiUrl}/tag/trending`).pipe(
        shareReplay(1)
      );
    }
    return this.trendingTags$;
  }

  createTag(dto: any): Observable<TagResponseDTO> {
    return this.http.post<TagResponseDTO>(`${this.apiUrl}/tag/create`, dto).pipe(
      tap(() => this.clearCache())
    );
  }

  deleteTag(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/tag/delete/${id}`).pipe(
      tap(() => this.clearCache())
    );
  }

  addTagToPost(postId: number, tagId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/tag/assign`, { postId, tagId }).pipe(
      tap(() => this.clearCache())
    );
  }

  removeTagFromPost(postId: number, tagId: number): Observable<any> {
    return this.http.request('DELETE', `${this.apiUrl}/tag/remove`, { body: { postId, tagId } }).pipe(
      tap(() => this.clearCache())
    );
  }

  getCategoryBySlug(slug: string): Observable<CategoryResponseDTO> {
    return this.http.get<CategoryResponseDTO>(`${this.apiUrl}/slug/${slug}`);
  }

  getChildCategories(parentId: number): Observable<CategoryResponseDTO[]> {
    return this.http.get<CategoryResponseDTO[]>(`${this.apiUrl}/children/${parentId}`);
  }

  getTagById(id: number): Observable<TagResponseDTO> {
    return this.http.get<TagResponseDTO>(`${this.apiUrl}/tag/${id}`);
  }

  getTagBySlug(slug: string): Observable<TagResponseDTO> {
    return this.http.get<TagResponseDTO>(`${this.apiUrl}/tag/slug/${slug}`);
  }

  getTagsByPost(postId: number): Observable<TagResponseDTO[]> {
    return this.http.get<TagResponseDTO[]>(`${this.apiUrl}/tag/post/${postId}`);
  }

  assignCategoryToPost(postId: number, categoryId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/assign`, { postId, categoryId }).pipe(
      tap(() => this.clearCache())
    );
  }

  removeCategoryFromPost(postId: number, categoryId: number): Observable<any> {
    return this.http.request('DELETE', `${this.apiUrl}/unassign`, { body: { postId, categoryId } }).pipe(
      tap(() => this.clearCache())
    );
  }

  getCategoriesByPost(postId: number): Observable<CategoryResponseDTO[]> {
    if (!this.postCategoriesCache.has(postId)) {
      const request$ = this.http.get<CategoryResponseDTO[]>(`${this.apiUrl}/post/${postId}`).pipe(
        shareReplay(1)
      );
      this.postCategoriesCache.set(postId, request$);
    }
    return this.postCategoriesCache.get(postId)!;
  }

  getPostIdsByCategorySlug(slug: string): Observable<number[]> {
    return this.http.get<number[]>(`${this.apiUrl}/slug/${slug}/posts`);
  }

  getPostIdsByTagSlug(slug: string): Observable<number[]> {
    return this.http.get<number[]>(`${this.apiUrl}/tag/slug/${slug}/posts`);
  }
}

