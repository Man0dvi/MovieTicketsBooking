// src/app/features/auth/auth.guard.ts
import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

export const authGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {
  const router = inject(Router);

  const raw = localStorage.getItem('cinema_auth');

  if (raw) {
    return true;
  }

  router.navigate(['/signin'], {
    queryParams: { returnUrl: state.url }
  });

  return false;
};
