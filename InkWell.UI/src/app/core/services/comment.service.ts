import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, shareReplay, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CommentResponseDTO } from '../models/comment.model';

@Injectable({
  providedIn: 'root'
})
export class CommentService {
  private readonly apiUrl = `${environment.apiUrl}/api/comment`;

  constructor(private http: HttpClient) { }

  getByPost(postId: number): Observable<CommentResponseDTO[]> {
    return this.http.get<CommentResponseDTO[]>(`${this.apiUrl}/post/${postId}`);
  }

  getTopLevel(postId: number): Observable<CommentResponseDTO[]> {
    return this.http.get<CommentResponseDTO[]>(`${this.apiUrl}/post/${postId}/top-level`);
  }

  getReplies(parentCommentId: number): Observable<CommentResponseDTO[]> {
    return this.http.get<CommentResponseDTO[]>(`${this.apiUrl}/replies/${parentCommentId}`);
  }

  private commentCountCache = new Map<number, Observable<number>>();

  clearCache(): void {
    this.commentCountCache.clear();
  }

  addComment(dto: { postId: number, content: string, parentCommentId?: number, postAuthorId?: number }): Observable<CommentResponseDTO> {
    return this.http.post<CommentResponseDTO>(`${this.apiUrl}/add`, dto).pipe(
      tap(() => this.clearCache())
    );
  }

  deleteComment(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/delete/${id}`).pipe(
      tap(() => this.clearCache())
    );
  }

  approveComment(id: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/approve/${id}`, {});
  }

  rejectComment(id: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/reject/${id}`, {});
  }

  likeComment(id: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/like/${id}`, {});
  }

  getCommentCount(postId: number): Observable<number> {
    if (!this.commentCountCache.has(postId)) {
      const request$ = this.http.get<{ count: number }>(`${this.apiUrl}/count/${postId}`).pipe(
        map(res => res.count),
        shareReplay(1)
      );
      this.commentCountCache.set(postId, request$);
    }
    return this.commentCountCache.get(postId)!;
  }

  unlikeComment(id: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/unlike/${id}`, {});
  }

  updateComment(id: number, content: string): Observable<CommentResponseDTO> {
    return this.http.put<CommentResponseDTO>(`${this.apiUrl}/update/${id}`, { content });
  }

  getCommentById(id: number): Observable<CommentResponseDTO> {
    return this.http.get<CommentResponseDTO>(`${this.apiUrl}/${id}`);
  }
}
