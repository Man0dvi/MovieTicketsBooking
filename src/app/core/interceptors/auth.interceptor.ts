// src/app/core/interceptors/auth.interceptor.ts
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

/**
 * AuthInterceptor
 * - Reads token from localStorage['cinema_auth'] (shape: { token, id, username, ... })
 * - Adds header: Authorization: Bearer <token> when present
 * - On 401 responses, clears auth storage (basic handling) and rethrows error.
 *
 * This interceptor DOES NOT inject AuthService to avoid circular DI at startup.
 */
@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private storageKey = 'cinema_auth';

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.readTokenFromStorage();

    let authReq = req;
    if (token) {
      authReq = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }

    return next.handle(authReq).pipe(
      catchError((err: HttpErrorResponse) => {
        // Basic centralized error behavior:
        if (err && err.status === 401) {
          // Unauthorized: clear local auth so UI can react to logout.
          try { localStorage.removeItem(this.storageKey); } catch (e) { /* ignore */ }

          // Optionally: redirect to sign-in page automatically:
          // window.location.href = '/signin';
          // I leave redirect commented out so app code can handle navigation as desired.
        }
        return throwError(() => err);
      })
    );
  }

  private readTokenFromStorage(): string | null {
    try {
      const raw = localStorage.getItem(this.storageKey);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      return parsed?.token ?? null;
    } catch {
      return null;
    }
  }
}
