// src/app/features/auth/services/auth.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { map, switchMap, tap, catchError } from 'rxjs/operators';

/**
 * Minimal User interface. Replace with your project's model import if available:
 * import { User } from 'src/app/models/user.model';
 */
export interface User {
  id?: number;
  name?: string;
  email?: string;
  phone?: string;
  password?: string;
  // add other fields you use in the app
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly apiBase = 'http://localhost:3000';
  private readonly usersEndpoint = `${this.apiBase}/users`;
  private readonly sessionKey = 'cinema_auth'; // localStorage key

  private currentUserSubject = new BehaviorSubject<User | null>(this.loadStoredUser());
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {}

  /**
   * Load stored user (if any) from localStorage
   */
  private loadStoredUser(): User | null {
    try {
      const raw = localStorage.getItem(this.sessionKey);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      return parsed && parsed.user ? parsed.user : (parsed as User) || null;
    } catch (err) {
      console.warn('AuthService: failed to parse stored session', err);
      return null;
    }
  }

  /**
   * Get stored token (if any)
   */
  getToken(): string | null {
    try {
      const raw = localStorage.getItem(this.sessionKey);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      return parsed && parsed.token ? parsed.token : null;
    } catch {
      return null;
    }
  }

  /**
   * Return current user snapshot
   */
  getCurrentUser(): User | null {
    return this.currentUserSubject.getValue();
  }

  /**
   * True if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  /**
   * Sign up a new user. json-server: POST /users
   * Expects the payload to match your users schema in db.json.
   * On success stores { user, token } into localStorage and updates currentUser$
   */
  signup(payload: Partial<User>): Observable<User> {
    return this.http.post<User>(this.usersEndpoint, payload).pipe(
      tap((createdUser) => {
        const token = this.generateToken();
        localStorage.setItem(this.sessionKey, JSON.stringify({ user: createdUser, token }));
        this.currentUserSubject.next(createdUser);
      }),
      catchError(err => {
        // bubble error
        return throwError(() => err);
      })
    );
  }

  /**
   * Sign in using email/phone + password.
   * Uses json-server query: GET /users?email=..&password=..  (or phone)
   * On success stores { user, token } into localStorage and updates currentUser$
   */
  signin(identifier: { email?: string; phone?: string }, password: string): Observable<User> {
    // choose query param (email or phone)
    const queryParts: string[] = [];
    if (identifier.email) {
      queryParts.push(`email=${encodeURIComponent(identifier.email)}`);
    }
    if (identifier.phone) {
      queryParts.push(`phone=${encodeURIComponent(identifier.phone)}`);
    }
    // include password in query (dev/demo only)
    queryParts.push(`password=${encodeURIComponent(password)}`);

    const query = queryParts.join('&');
    const url = `${this.usersEndpoint}?${query}`;

    return this.http.get<User[]>(url).pipe(
      map(users => {
        if (!users || users.length === 0) {
          throw new Error('Invalid credentials');
        }
        // choose the first matched user
        return users[0];
      }),
      tap(user => {
        const token = this.generateToken();
        localStorage.setItem(this.sessionKey, JSON.stringify({ user, token }));
        this.currentUserSubject.next(user);
      }),
      catchError(err => {
        return throwError(() => err);
      })
    );
  }

  /**
   * Sign out: clear local storage and reset subject
   */
  signout(): void {
    try {
      localStorage.removeItem(this.sessionKey);
    } catch {}
    this.currentUserSubject.next(null);
  }

  /**
   * Helper: generate a reasonably unique token for demo sessions
   */
  private generateToken(): string {
    try {
      if (typeof crypto !== 'undefined' && (crypto as any).randomUUID) {
        return (crypto as any).randomUUID();
      }
    } catch {}
    // fallback
    return Math.random().toString(36).slice(2) + Date.now().toString(36);
  }

  /**
   * Optionally refresh the stored user (in case server-side record changed)
   * Example usage: call after profile update or on app init if you want to re-fetch the user record
   */
  refreshUserFromServer(): Observable<User | null> {
    const user = this.getCurrentUser();
    if (!user || !user.id) {
      return of(null);
    }
    return this.http.get<User>(`${this.usersEndpoint}/${user.id}`).pipe(
      tap(fresh => {
        const token = this.getToken();
        if (fresh) {
          localStorage.setItem(this.sessionKey, JSON.stringify({ user: fresh, token }));
          this.currentUserSubject.next(fresh);
        }
      }),
      catchError(err => {
        // If refreshing fails, keep existing user but propagate error for callers to handle
        return throwError(() => err);
      })
    );
  }
}
