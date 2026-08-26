// jwt.interceptor.ts
import { HttpInterceptorFn } from '@angular/common/http';
import { inject, Injector } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { catchError, switchMap, take, throwError, Subject } from 'rxjs';
import { Router } from '@angular/router';

let isRefreshing = false;
let refreshSubject: Subject<string> | null = null;

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const injector = inject(Injector);
  const router = inject(Router);
  const auth = injector.get(AuthService);

  // ⬇️ Skip interceptor logic for the refresh endpoint itself
  if (req.url.includes('/refresh')) {
    return next(req); // let the request go through without any interception
  }

  const token = auth.getAccessToken();
  const authReq = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(authReq).pipe(
    catchError((error) => {
      if (error.status !== 401) {
        return throwError(() => error);
      }

      if (!isRefreshing) {
        isRefreshing = true;
        refreshSubject = new Subject<string>();

        auth
          .refreshToken()
          .then((newToken) => {
            refreshSubject!.next(newToken);
            refreshSubject!.complete();
          })
          .catch((refreshError) => {
            refreshSubject!.error(refreshError);
            auth.logout();
            router.navigate(['/login']);
          })
          .finally(() => {
            isRefreshing = false;
          });
      }

      return refreshSubject!.pipe(
        take(1),
        switchMap((newToken) => {
          const retryReq = req.clone({
            setHeaders: { Authorization: `Bearer ${newToken}` },
          });
          return next(retryReq);
        }),
        catchError((refreshError) => throwError(() => refreshError))
      );
    })
  );
};