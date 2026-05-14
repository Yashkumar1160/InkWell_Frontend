import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { inject, Injector } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { catchError, switchMap, throwError, Observable } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> => {
  const injector = inject(Injector);
  const token = localStorage.getItem('token');

  let authReq = req;
  if (token) {
    authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && token) {
        const authService = injector.get(AuthService);

        // Skip token refresh for auth endpoints to prevent infinite loops
        const isAuthEndpoint = req.url.includes('/auth/refresh') ||
                               req.url.includes('/auth/logout') ||
                               req.url.includes('/auth/validate');
        if (isAuthEndpoint) {
          authService.clearSessionAndRedirect();
          return throwError(() => error);
        }

        return authService.refreshToken(token).pipe(
          switchMap(newAuth => {
            const retryReq = req.clone({
              setHeaders: { Authorization: `Bearer ${newAuth.token}` }
            });
            return next(retryReq);
          }),
          catchError(refreshError => {
            // Don't make an HTTP call — just clear local state silently
            authService.clearSessionAndRedirect();
            return throwError(() => refreshError);
          })
        );
      }
      return throwError(() => error);
    })
  );
};
