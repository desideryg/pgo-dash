import { Injectable } from '@angular/core';
import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, throwError, switchMap, catchError as rxjsCatchError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<any>, next: HttpHandlerFn): Observable<HttpEvent<any>> => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Skip token refresh for auth endpoints to avoid infinite loops
  if (req.url.includes('/auth/login') || req.url.includes('/auth/refresh')) {
    return next(req);
  }

  // Get the auth token from the service
  const token = authService.getToken();

  // Clone the request and add the authorization header if token exists
  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  // Continue with the request and handle errors
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // If we get a 401 Unauthorized response, try to refresh the token
      if (error.status === 401 && !req.url.includes('/auth/')) {
        const refreshToken = authService.getRefreshToken();
        
        if (refreshToken) {
          // Attempt to refresh the token
          return authService.refreshToken().pipe(
            switchMap(() => {
              // Retry the original request with the new token
              const newToken = authService.getToken();
              const newReq = req.clone({
                setHeaders: {
                  Authorization: `Bearer ${newToken}`
                }
              });
              return next(newReq);
            }),
            rxjsCatchError((refreshError) => {
              // If refresh fails, logout and redirect to login
              authService.logout();
              router.navigate(['/login']);
              return throwError(() => refreshError);
            })
          );
        } else {
          // No refresh token available, logout and redirect
          authService.logout();
          router.navigate(['/login']);
        }
      }

      // If we get a 403 Forbidden response, user doesn't have permission
      if (error.status === 403) {
        console.error('Access denied: Insufficient permissions');
      }

      // Re-throw the error so it can be handled by the calling code
      return throwError(() => error);
    })
  );
};
