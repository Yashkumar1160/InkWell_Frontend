import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { AuthResponse, User } from '../models/auth.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly apiUrl = `${environment.apiUrl}/api/auth`;
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  constructor(private http: HttpClient, private router: Router) {
    this.loadUser();
  }

  fetchCurrentUser(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/profile`).pipe(
      tap(user => {
        const currentUser = this.currentUserSubject.value;
        if (currentUser) {
          const updatedUser = { ...currentUser, ...user };
          localStorage.setItem('user', JSON.stringify(updatedUser));
          this.currentUserSubject.next(updatedUser);
        }
      })
    );
  }

  login(credentials: any): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => this.handleAuth(response))
    );
  }

  register(userData: any): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, userData).pipe(
      tap(response => this.handleAuth(response))
    );
  }

  logout(): void {
    // Fire-and-forget the server-side logout (don't wait for result)
    const token = this.getToken();
    if (token) {
      this.http.post(`${this.apiUrl}/logout`, {}).subscribe({
        complete: () => {},
        error: () => {}  // Ignore errors — local session is cleared below
      });
    }
    this.clearSessionAndRedirect();
  }

  /** Clears local session without making an HTTP call. Used by the interceptor. */
  clearSessionAndRedirect(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  getUserRole(): string | null {
    const user = this.currentUserSubject.value;
    return user ? user.role : null;
  }

  private handleAuth(response: AuthResponse): void {
    if (response.token && response.userId) {
      const { token, ...userData } = response;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      this.currentUserSubject.next(userData as User);
    }
  }

  updateProfile(profileData: any): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/profile`, profileData).pipe(
      tap(response => {
        const currentUser = this.currentUserSubject.value;
        if (currentUser) {
          const updatedUser = { ...currentUser, ...profileData, ...response };
          localStorage.setItem('user', JSON.stringify(updatedUser));
          this.currentUserSubject.next(updatedUser);
        }
      })
    );
  }

  changePassword(passwordData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/password`, passwordData);
  }

  getPublicProfile(userId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/profile/${userId}`);
  }

  refreshToken(token: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/refresh`, JSON.stringify(token), {
      headers: { 'Content-Type': 'application/json' }
    }).pipe(tap(response => this.handleAuth(response)));
  }

  validateToken(token: string): Observable<{ valid: boolean }> {
    return this.http.post<{ valid: boolean }>(`${this.apiUrl}/validate`, JSON.stringify(token), {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  private loadUser(): void {
    const userJson = localStorage.getItem('user');
    if (userJson && userJson !== 'undefined' && userJson !== 'null') {
      try {
        this.currentUserSubject.next(JSON.parse(userJson));
      } catch (e) {
        console.error('Failed to parse user from localStorage', e);
        // Clear storage silently without HTTP call
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
  }
}
