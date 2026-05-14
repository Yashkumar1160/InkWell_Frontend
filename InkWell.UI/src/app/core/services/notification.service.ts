import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap, catchError, EMPTY } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private readonly apiUrl = `${environment.apiUrl}/api/notification`;
  
  private unreadCountSubject = new BehaviorSubject<number>(0);
  unreadCount$ = this.unreadCountSubject.asObservable();

  constructor(private http: HttpClient) { }

  /** Fetches unread count from server. Silently ignores errors (e.g. 401). */
  refreshUnreadCount(): void {
    this.http.get<{ count: number }>(`${this.apiUrl}/unread-count`).pipe(
      catchError(() => EMPTY) // Swallow any error — don't throw, don't loop
    ).subscribe(res => {
      this.unreadCountSubject.next(res.count);
    });
  }

  /** Resets the count locally without an API call. Used on logout. */
  resetUnreadCount(): void {
    this.unreadCountSubject.next(0);
  }

  getUnreadCount(): Observable<{ count: number }> {
    return this.http.get<{ count: number }>(`${this.apiUrl}/unread-count`).pipe(
      tap(res => this.unreadCountSubject.next(res.count))
    );
  }

  getNotifications(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/my`);
  }

  markAsRead(id: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/read/${id}`, {}).pipe(
      tap(() => this.refreshUnreadCount())
    );
  }

  markAllAsRead(): Observable<any> {
    return this.http.put(`${this.apiUrl}/read-all`, {}).pipe(
      tap(() => this.unreadCountSubject.next(0))
    );
  }

  deleteNotification(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/delete/${id}`).pipe(
      tap(() => this.refreshUnreadCount())
    );
  }

  deleteReadNotifications(): Observable<any> {
    return this.http.delete(`${this.apiUrl}/delete-read`);
  }

  getUnreadNotifications(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/unread`);
  }
}
