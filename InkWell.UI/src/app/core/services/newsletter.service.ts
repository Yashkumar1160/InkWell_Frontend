import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Subscriber } from '../models/newsletter.model';

import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class NewsletterService {
  private readonly apiUrl = `${environment.apiUrl}/api/newsletter`;

  constructor(private http: HttpClient) {}

  subscribe(email: string, fullName: string, userId?: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/subscribe`, { email, fullName, userId });
  }

  confirmSubscription(token: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/confirm/${token}`);
  }

  unsubscribe(token: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/unsubscribe/${token}`);
  }

  updatePreferences(token: string, preferences: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/preferences/${token}`, preferences);
  }

  updateMyPreferences(preferences: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/my-preferences`, preferences);
  }
}
