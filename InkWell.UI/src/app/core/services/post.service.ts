import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, shareReplay, tap } from 'rxjs';
import { Post } from '../models/post.model';

import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PostService {
  private readonly apiUrl = `${environment.apiUrl}/api/post`;

  // Client-side cache store for active streams
  private publishedPosts$: Observable<Post[]> | null = null;
  private myPosts$: Observable<Post[]> | null = null;

  constructor(private http: HttpClient) { }

  // Clear in-memory cache to force a fresh fetch
  clearCache(): void {
    this.publishedPosts$ = null;
    this.myPosts$ = null;
  }

  getPublishedPosts(): Observable<Post[]> {
    if (!this.publishedPosts$) {
      this.publishedPosts$ = this.http.get<Post[]>(`${this.apiUrl}/published?t=${new Date().getTime()}`).pipe(
        shareReplay(1)
      );
    }
    return this.publishedPosts$;
  }

  getPostBySlug(slug: string): Observable<Post> {
    return this.http.get<Post>(`${this.apiUrl}/slug/${slug}`);
  }

  searchPosts(keyword: string): Observable<Post[]> {
    return this.http.get<Post[]>(`${this.apiUrl}/search?keyword=${keyword}`);
  }

  getMyPosts(): Observable<Post[]> {
    if (!this.myPosts$) {
      this.myPosts$ = this.http.get<Post[]>(`${this.apiUrl}/my-posts`).pipe(
        shareReplay(1)
      );
    }
    return this.myPosts$;
  }

  createPost(post: any): Observable<Post> {
    return this.http.post<Post>(`${this.apiUrl}/create`, post).pipe(
      tap(() => this.clearCache())
    );
  }

  getPostById(id: number): Observable<Post> {
    return this.http.get<Post>(`${this.apiUrl}/${id}`);
  }

  updatePost(id: number, post: any): Observable<Post> {
    return this.http.put<Post>(`${this.apiUrl}/update/${id}`, post).pipe(
      tap(() => this.clearCache())
    );
  }

  publishPost(id: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/publish/${id}`, {}).pipe(
      tap(() => this.clearCache())
    );
  }

  unpublishPost(id: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/unpublish/${id}`, {}).pipe(
      tap(() => this.clearCache())
    );
  }

  deletePost(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/delete/${id}`).pipe(
      tap(() => this.clearCache())
    );
  }

  likePost(id: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/like/${id}`, {}).pipe(
      tap(() => this.clearCache())
    );
  }

  unlikePost(id: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/unlike/${id}`, {}).pipe(
      tap(() => this.clearCache())
    );
  }

  getPostsByAuthor(authorId: number): Observable<Post[]> {
    return this.http.get<Post[]>(`${this.apiUrl}/author/${authorId}`);
  }

  archivePost(id: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/archive/${id}`, {}).pipe(
      tap(() => this.clearCache())
    );
  }

  unarchivePost(id: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/unarchive/${id}`, {}).pipe(
      tap(() => this.clearCache())
    );
  }

  getPostCount(authorId: number): Observable<{ count: number }> {
    return this.http.get<{ count: number }>(`${this.apiUrl}/count/${authorId}`);
  }
}
export type { Post };


