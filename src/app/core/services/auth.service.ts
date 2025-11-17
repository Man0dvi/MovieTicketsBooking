// src/app/core/services/auth.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { ApiService } from './api.service';
import { User } from '../../models/user.model';
import { map, switchMap, tap, catchError } from 'rxjs/operators';

const STORAGE_KEY = 'cinema_auth'; // keep same key your app uses

@Injectable({ providedIn: 'root' })
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(this.loadUser());
  public currentUser$ = this.currentUserSubject.asObservable();

  private token: string | null = this.loadToken();

  constructor(private api: ApiService) {}

  private loadFromStorage(): { token?: string; [key: string]: any } | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  private loadToken(): string | null {
    const r = this.loadFromStorage();
    return r?.token ?? null;
  }

  private loadUser(): User | null {
    const r = this.loadFromStorage();
    if (!r) return null;
    // storage format we use: { token, id, username, phone, email, ... }
    const { token, ...userLike } = r;
    if (!userLike || Object.keys(userLike).length === 0) return null;
    // ensure no password is leaked by default
    const { password, ...rest } = userLike as any;
    return (rest as User) ?? null;
  }

  private saveToStorage(token: string, user: User) {
    try {
      // Keep legacy shape: cinema_auth contains user fields at top-level.
      // Add token alongside them so older code reading e.g. cinema_auth.id works.
      const toSave = { token, ...user };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
    } catch (e) {
      console.warn('Failed to save auth to storage', e);
    }
  }

  private clearStorage() {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
  }

  private generateToken(): string {
    return Math.random().toString(36).slice(2) + '.' + Date.now();
  }

  isLoggedIn(): boolean {
    return !!this.token && !!this.currentUserSubject.value;
  }

  getToken(): string | null {
    return this.token;
  }

  /**
   * Sign-in using phone + password (template-driven sign-in)
   * Returns observable of { token, user }
   */
  signIn(phone: string, password: string): Observable<{ token: string; user: User }> {
    const query = `users?phone=${encodeURIComponent(phone)}&password=${encodeURIComponent(password)}`;
    return this.api.get<User[]>(query).pipe(
      map(users => (users && users.length ? users[0] : null)),
      switchMap(found => {
        if (!found) {
          return throwError(() => new Error('Invalid phone number or password'));
        }
        // remove password field before storing/exposing
        const { password: _pw, ...userWithoutPw } = found as any;
        const token = this.generateToken();
        this.token = token;
        this.saveToStorage(token, userWithoutPw as User);
        this.currentUserSubject.next(userWithoutPw as User);
        return of({ token, user: (userWithoutPw as User) });
      }),
      catchError(err => throwError(() => err))
    );
  }

  /**
   * Sign-up using username, phone, email, password (reactive signup)
   * Checks for existing phone or email first
   */
  signUp(payload: { username: string; phone: string; email: string; password: string }): Observable<{ token: string; user: User }> {
    // Check existing by email or phone
    const qEmail = `users?email=${encodeURIComponent(payload.email)}`;
    const qPhone = `users?phone=${encodeURIComponent(payload.phone)}`;

    // First check email
    return this.api.get<User[]>(qEmail).pipe(
      switchMap(existingEmail => {
        if (existingEmail && existingEmail.length > 0) {
          return throwError(() => new Error('Email already registered'));
        }
        // Next check phone
        return this.api.get<User[]>(qPhone);
      }),
      switchMap(existingPhone => {
        if (existingPhone && existingPhone.length > 0) {
          return throwError(() => new Error('Phone number already registered'));
        }
        // create new user
        // json-server will return created user with id
        return this.api.post<User>('users', payload);
      }),
      map(created => {
        // strip password before emitting/storing user object
        const { password: _pw, ...userWithoutPw } = created as any;
        const token = this.generateToken();
        this.token = token;
        this.saveToStorage(token, userWithoutPw as User);
        this.currentUserSubject.next(userWithoutPw as User);
        return { token, user: (userWithoutPw as User) };
      }),
      catchError(err => throwError(() => err))
    );
  }

  logout() {
    this.token = null;
    this.currentUserSubject.next(null);
    this.clearStorage();
  }

  updateLocalUser(user: User) {
    const tok = this.token;
    if (tok) {
      this.saveToStorage(tok, user);
    } else {
      // if no token, still save plain user to maintain legacy shape
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...user }));
      } catch {}
    }
    this.currentUserSubject.next(user);
  }
}
