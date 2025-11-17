// src/app/core/interceptors/auth.interceptor.ts
import { Injectable } from '@angular/core';
import {
  HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpErrorResponse, HTTP_INTERCEPTORS
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ToastService } from '../services/toast.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  // key must match what your AuthService writes (cinema_auth)
  private readonly sessionKey = 'cinema_auth';

  constructor(private toast: ToastService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    let cloned = req;
    try {
      const raw = localStorage.getItem(this.sessionKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        // parsed could be { user, token } or just user object depending on your auth.service version
        const token = parsed && parsed.token ? parsed.token : (parsed && parsed.authToken ? parsed.authToken : null);
        if (token) {
          cloned = req.clone({
            setHeaders: {
              Authorization: `Bearer ${token}`
            }
          });
        }
      }
    } catch (err) {
      // silently ignore parse errors
      console.warn('AuthInterceptor: error reading session', err);
    }

    return next.handle(cloned).pipe(
      catchError((error: HttpErrorResponse) => {
        // show toast on API errors (network or 4xx/5xx)
        const msg = (error && error.message) ? error.message : 'API error';
        this.toast.showError(msg);
        return throwError(() => error);
      })
    );
  }
}
