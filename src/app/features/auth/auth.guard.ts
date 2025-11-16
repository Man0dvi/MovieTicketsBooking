import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(): boolean | UrlTree {
    const raw = localStorage.getItem('cinema_auth');
    if (!raw) {
      // redirect to sign in
      return this.router.parseUrl('/signin');
    }
    try {
      const user = JSON.parse(raw);
      if (user && user.id) return true;
    } catch {
      // fallthrough
    }
    return this.router.parseUrl('/signin');
  }
}
