import {
  HttpErrorResponse,
  HttpInterceptorFn
} from '@angular/common/http';

import { inject } from '@angular/core';
import { Router } from '@angular/router';

import {
  catchError,
  from,
  switchMap,
  throwError
} from 'rxjs';

import { AuthService } from '../services/auth.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const auth = inject(AuthService);


  if (req.url.includes('/api/auth/')) { return next(req); }
  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {

      if (err.status !== 401) {
        const detailMessage =
          err.error?.detail ??
          'A system error occured. Please try again.';

        console.error(
          'API Error Response:',
          detailMessage
        );

        return throwError(() => err);
      }

      // Don't try refresh on login/refresh endpoints
      if (
        req.url.includes('/auth/login') ||
        req.url.includes('/auth/refresh')
      ) {
        auth.logout();
        router.navigate(['/login']);

        return throwError(() => err);
      }

      // Access token expired -> refresh it
      return from(auth.refreshToken()).pipe(
        switchMap((newToken) => {

          const retryRequest = req.clone({
            setHeaders: {
              Authorization: `Bearer ${newToken}`
            }
          });

          return next(retryRequest);
        }),

        catchError((refreshError) => {

          console.warn(
            'Refresh token failed. Redirecting to login.'
          );

          auth.logout();
          router.navigate(['/login']);

          return throwError(() => refreshError);
        })
      );
    })
  );
};