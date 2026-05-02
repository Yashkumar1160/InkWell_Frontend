import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Post } from '../models/post.model';

import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PostService {
  private readonly apiUrl = `${environment.apiUrl}/api/post`;

  constructor(private http: HttpClient) { }

  getPublishedPosts(): Observable<Post[]> {
    return this.http.get<Post[]>(`${this.apiUrl}/published?t=${new Date().getTime()}`);
  }

  getPostBySlug(slug: string): Observable<Post> {
    return this.http.get<Post>(`${this.apiUrl}/slug/${slug}`);
  }

  searchPosts(keyword: string): Observable<Post[]> {
    return this.http.get<Post[]>(`${this.apiUrl}/search?keyword=${keyword}`);
  }

  getMyPosts(): Observable<Post[]> {
    return this.http.get<Post[]>(`${this.apiUrl}/my-posts`);
  }

  createPost(post: any): Observable<Post> {
    return this.http.post<Post>(`${this.apiUrl}/create`, post);
  }

  getPostById(id: number): Observable<Post> {
    return this.http.get<Post>(`${this.apiUrl}/${id}`);
  }

  updatePost(id: number, post: any): Observable<Post> {
    return this.http.put<Post>(`${this.apiUrl}/update/${id}`, post);
  }

  publishPost(id: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/publish/${id}`, {});
  }

  unpublishPost(id: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/unpublish/${id}`, {});
  }

  deletePost(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/delete/${id}`);
  }

  likePost(id: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/like/${id}`, {});
  }

  unlikePost(id: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/unlike/${id}`, {});
  }

  getPostsByAuthor(authorId: number): Observable<Post[]> {
    return this.http.get<Post[]>(`${this.apiUrl}/author/${authorId}`);
  }

  archivePost(id: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/archive/${id}`, {});
  }

  unarchivePost(id: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/unarchive/${id}`, {});
  }

  getPostCount(authorId: number): Observable<{ count: number }> {
    return this.http.get<{ count: number }>(`${this.apiUrl}/count/${authorId}`);
  }
}
export type { Post };

