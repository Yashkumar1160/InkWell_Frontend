import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private readonly authApi = `${environment.apiUrl}/api/auth`;
  private readonly postApi = `${environment.apiUrl}/api/post`;
  private readonly newsletterApi = `${environment.apiUrl}/api/newsletter`;
  private readonly mediaApi = `${environment.apiUrl}/api/media`;
  private readonly commentApi = `${environment.apiUrl}/api/comment`;

  constructor(private http: HttpClient) { }

  // User Management
  getAllUsers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.authApi}/users`);
  }

  changeUserRole(userId: number, role: string): Observable<any> {
    return this.http.put(`${this.authApi}/role/${userId}`, JSON.stringify(role), {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  deactivateUser(userId: number): Observable<any> {
    return this.http.delete(`${this.authApi}/deactivate/${userId}`);
  }

  reactivateUser(userId: number): Observable<any> {
    return this.http.post(`${this.authApi}/reactivate/${userId}`, {});
  }

  deleteUser(userId: number): Observable<any> {
    return this.http.delete(`${this.authApi}/delete/${userId}`);
  }

  // Post Management
  getAllPosts(): Observable<any[]> {
    return this.http.get<any[]>(`${this.postApi}/all`);
  }

  featurePost(postId: number): Observable<any> {
    return this.http.put(`${this.postApi}/feature/${postId}`, {});
  }

  unfeaturePost(postId: number): Observable<any> {
    return this.http.put(`${this.postApi}/unfeature/${postId}`, {});
  }

  deletePost(postId: number): Observable<any> {
    return this.http.delete(`${this.postApi}/delete/${postId}`);
  }

  // Newsletter Management
  getAllSubscribers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.newsletterApi}/all`);
  }

  sendNewsletter(dto: any): Observable<any> {
    return this.http.post(`${this.newsletterApi}/send`, dto);
  }

  // Media Management
  getAllMedia(): Observable<any[]> {
    return this.http.get<any[]>(`${this.mediaApi}/all`);
  }

  deleteMedia(mediaId: number): Observable<any> {
    return this.http.delete(`${this.mediaApi}/delete/${mediaId}`);
  }

  // Comment Management
  getAllComments(): Observable<any[]> {
    return this.http.get<any[]>(`${environment.apiUrl}/api/comment/status?status=APPROVED`);
  }

  getPendingComments(): Observable<any[]> {
    return this.http.get<any[]>(`${environment.apiUrl}/api/comment/status?status=PENDING`);
  }

  approveComment(commentId: number): Observable<any> {
    return this.http.put(`${environment.apiUrl}/api/comment/approve/${commentId}`, {});
  }

  rejectComment(commentId: number): Observable<any> {
    return this.http.put(`${environment.apiUrl}/api/comment/reject/${commentId}`, {});
  }

  deleteComment(commentId: number): Observable<any> {
    return this.http.delete(`${this.commentApi}/delete/${commentId}`);
  }

  setModerationMode(enabled: boolean): Observable<any> {
    return this.http.put(`${this.commentApi}/moderation?enabled=${enabled}`, {});
  }

  getModerationMode(): Observable<{ moderationEnabled: boolean }> {
    return this.http.get<{ moderationEnabled: boolean }>(`${this.commentApi}/moderation`);
  }

  // Newsletter
  getSubscriberCount(): Observable<{ count: number }> {
    return this.http.get<{ count: number }>(`${this.newsletterApi}/count`);
  }
  getSubscribersByStatus(status: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.newsletterApi}/by-status?status=${status}`);
  }
  deleteSubscriber(id: number): Observable<any> {
    return this.http.delete(`${this.newsletterApi}/delete/${id}`);
  }
  getSubscriberByEmail(email: string): Observable<any> {
    return this.http.get<any>(`${this.newsletterApi}/by-email?email=${encodeURIComponent(email)}`);
  }

  // Posts
  getPostsByStatus(status: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.postApi}/by-status?status=${status}`);
  }

  // Notifications
  getAllNotifications(): Observable<any[]> {
    return this.http.get<any[]>(`${environment.apiUrl}/api/notification/all`);
  }
  broadcastNotification(dto: { recipientIds: number[], title?: string, message: string, roleFilter?: string }): Observable<any> {
    return this.http.post(`${environment.apiUrl}/api/notification/broadcast`, dto);
  }

  getNotificationsByType(type: string): Observable<any[]> {
    return this.http.get<any[]>(`${environment.apiUrl}/api/notification/by-type?type=${type}`);
  }

  getNotificationsByRelatedId(relatedId: number): Observable<any[]> {
    return this.http.get<any[]>(`${environment.apiUrl}/api/notification/by-related/${relatedId}`);
  }

  // Auth
  getUsersByRole(role: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.authApi}/users/by-role?role=${role}`);
  }
  searchUsers(keyword: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.authApi}/search?keyword=${keyword}`);
  }
  getUserByEmail(email: string): Observable<any> {
    return this.http.get<any>(`${this.authApi}/users/by-email?email=${email}`);
  }

  // Media
  getMediaByMimeType(mimeType: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.mediaApi}/by-type?mimeType=${mimeType}`);
  }
  cleanupDeletedMedia(): Observable<any> {
    return this.http.delete(`${this.mediaApi}/cleanup`);
  }
  getDeletedMedia(): Observable<any[]> {
    return this.http.get<any[]>(`${this.mediaApi}/deleted`);
  }
}
