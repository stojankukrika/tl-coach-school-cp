import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { from, throwError, of } from 'rxjs';
import { switchMap, catchError, take } from 'rxjs/operators';
import { StorageService } from '../services/storage.service';
import { AuthConstants } from '../config/auth-constants';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const storage = inject(StorageService);
  const router = inject(Router);
  const authService = inject(AuthService);

  // 1. Skip interceptor for login/register to avoid loops on failed credentials
  if (req.url.includes('login') || req.url.includes('register')) {
    return next(req);
  }

  return from(storage.get(AuthConstants.TOKEN)).pipe(
    switchMap(token => {
      const authReq = token 
        ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) 
        : req;

      return next(authReq).pipe(
        catchError((error: HttpErrorResponse) => {
          if (error.status === 401) {
            // Check if we are already on the sign-in page to prevent infinite loops
            if (!router.url.includes('sign-in')) {
              console.warn('Unauthorized - Triggering global logout');
              
              // Use the central AuthService logout logic
              authService.logout().then(() => {
                router.navigateByUrl('/sign-in', { replaceUrl: true });
              });
            }
          }
          return throwError(() => error);
        })
      );
    })
  );
};