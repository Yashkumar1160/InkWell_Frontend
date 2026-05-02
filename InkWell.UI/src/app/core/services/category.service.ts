import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CategoryResponseDTO, TagResponseDTO } from '../models/category.model';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private readonly apiUrl = `${environment.apiUrl}/api/category`;

  constructor(private http: HttpClient) { }

  // Categories
  getAllCategories(): Observable<CategoryResponseDTO[]> {
    return this.http.get<CategoryResponseDTO[]>(`${this.apiUrl}/all`);
  }

  getCategoryById(id: number): Observable<CategoryResponseDTO> {
    return this.http.get<CategoryResponseDTO>(`${this.apiUrl}/${id}`);
  }

  createCategory(dto: any): Observable<CategoryResponseDTO> {
    return this.http.post<CategoryResponseDTO>(`${this.apiUrl}/create`, dto);
  }

  updateCategory(id: number, dto: any): Observable<CategoryResponseDTO> {
    return this.http.put<CategoryResponseDTO>(`${this.apiUrl}/update/${id}`, dto);
  }

  deleteCategory(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/delete/${id}`);
  }

  // Tags
  getAllTags(): Observable<TagResponseDTO[]> {
    return this.http.get<TagResponseDTO[]>(`${this.apiUrl}/tag/all`);
  }

  getTrendingTags(): Observable<TagResponseDTO[]> {
    return this.http.get<TagResponseDTO[]>(`${this.apiUrl}/tag/trending`);
  }

  createTag(dto: any): Observable<TagResponseDTO> {
    return this.http.post<TagResponseDTO>(`${this.apiUrl}/tag/create`, dto);
  }

  deleteTag(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/tag/delete/${id}`);
  }

  addTagToPost(postId: number, tagId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/tag/assign`, { postId, tagId });
  }
  removeTagFromPost(postId: number, tagId: number): Observable<any> {
    return this.http.request('DELETE', `${this.apiUrl}/tag/remove`, { body: { postId, tagId } });
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
    return this.http.post(`${this.apiUrl}/assign`, { postId, categoryId });
  }

  removeCategoryFromPost(postId: number, categoryId: number): Observable<any> {
    return this.http.request('DELETE', `${this.apiUrl}/unassign`, { body: { postId, categoryId } });
  }

  getCategoriesByPost(postId: number): Observable<CategoryResponseDTO[]> {
    return this.http.get<CategoryResponseDTO[]>(`${this.apiUrl}/post/${postId}`);
  }
}
