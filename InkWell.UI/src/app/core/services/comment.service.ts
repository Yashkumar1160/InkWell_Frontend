import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
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

  addComment(dto: { postId: number, content: string, parentCommentId?: number, postAuthorId?: number }): Observable<CommentResponseDTO> {
    return this.http.post<CommentResponseDTO>(`${this.apiUrl}/add`, dto);
  }

  deleteComment(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/delete/${id}`);
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
    return this.http.get<{ count: number }>(`${this.apiUrl}/count/${postId}`).pipe(
      map(res => res.count)
    );
  }

  unlikeComment(id: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/unlike/${id}`, {});
  }

  updateComment(id: number, content: string): Observable<CommentResponseDTO> {
    return this.http.put<CommentResponseDTO>(`${this.apiUrl}/update/${id}`, { content });
  }
}
