// src/app/core/interceptors/error.interceptor.ts
import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { NotificationService } from '../services/notification.service';
import { AuthService } from '../services/auth.service';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(private notify: NotificationService, private auth: AuthService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError((err: HttpErrorResponse) => {
        // provide a friendly message
        const msg = this.friendlyMessage(err);
        // If 401: optionally clear auth and notify
        if (err.status === 401) {
          // optional: log out user to remove stale token
          try { this.auth.logout(); } catch {}
          this.notify.error('Session expired. Please sign in again.');
        } else {
          // show other errors
          this.notify.error(msg);
        }
        return throwError(() => err);
      })
    );
  }

  private friendlyMessage(err: HttpErrorResponse): string {
    if (!err) return 'Unknown error';
    if (err.status === 0) return 'Network error — check your connection or json-server.';
    if (err.status >= 500) return 'Server error. Please try again later.';
    if (err.status === 404) return 'Requested resource not found.';
    if (err.error && typeof err.error === 'string') return err.error;
    if (err.error && typeof err.error.message === 'string') return err.error.message;
    return `Request failed (${err.status}).`;
  }
}
