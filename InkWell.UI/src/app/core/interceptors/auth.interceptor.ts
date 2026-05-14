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
      setHeaders: { Authorization: `Bearer ${token}` }
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
            // Retry the request — if it fails again, just propagate the error
            // Do NOT log the user out on a failed retry (the service may be down)
            return next(retryReq).pipe(
              catchError(retryError => throwError(() => retryError))
            );
          }),
          catchError(() => {
            // Only clear session if the REFRESH ITSELF failed (expired/invalid token)
            authService.clearSessionAndRedirect();
            return throwError(() => error);
          })
        );
      }
      return throwError(() => error);
    })
  );
};
