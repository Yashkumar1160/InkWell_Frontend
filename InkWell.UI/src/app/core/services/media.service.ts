import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface MediaResponse {
  mediaId: number;
  uploaderId: number;
  fileName: string;
  url: string;
  mimeType: string;
  sizeKb: number;
  altText: string;
  linkedPostId?: number;
  uploadedAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class MediaService {
  private readonly apiUrl = `${environment.apiUrl}/api/media`;

  constructor(private http: HttpClient) { }

  upload(file: File): Observable<MediaResponse> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<MediaResponse>(`${this.apiUrl}/upload`, formData);
  }

  getById(id: number): Observable<MediaResponse> {
    return this.http.get<MediaResponse>(`${this.apiUrl}/${id}`);
  }

  getMyFiles(): Observable<MediaResponse[]> {
    return this.http.get<MediaResponse[]>(`${this.apiUrl}/my-files`);
  }

  getByPost(postId: number): Observable<MediaResponse[]> {
    return this.http.get<MediaResponse[]>(`${this.apiUrl}/post/${postId}`);
  }

  getMediaCount(): Observable<{ count: number }> {
    return this.http.get<{ count: number }>(`${this.apiUrl}/count`);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/delete/${id}`);
  }

  updateAltText(id: number, altText: string): Observable<MediaResponse> {
    return this.http.put<MediaResponse>(`${this.apiUrl}/alt-text/${id}`, { altText });
  }

  linkToPost(id: number, postId: number): Observable<MediaResponse> {
    return this.http.put<MediaResponse>(`${this.apiUrl}/link/${id}`, { postId });
  }

  unlinkFromPost(id: number): Observable<MediaResponse> {
    return this.http.put<MediaResponse>(`${this.apiUrl}/unlink/${id}`, {});
  }
}
