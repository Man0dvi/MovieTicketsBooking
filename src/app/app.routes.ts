import { Routes } from '@angular/router';
import { authGuard } from './features/auth/auth.guard';

export const routes: Routes = [
  { path: 'signin', loadComponent: () => import('./features/auth/sign-in/sign-in.component').then(m => m.SignInComponent) },
  { path: 'signup', loadComponent: () => import('./features/auth/sign-up/sign-up.component').then(m => m.SignUpComponent) },

  // protected routes (all others) - add canActivate
  { path: '', loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent), canActivate: [authGuard] },
  { path: 'movies', loadComponent: () => import('./features/movies/movie-list/movie-list.component').then(m => m.MovieListComponent), canActivate: [authGuard] },
  { path: 'movies/:id', loadComponent: () => import('./features/movies/movie-detail/movie-detail.component').then(m => m.MovieDetailComponent), canActivate: [authGuard] },
  { path: 'booking', loadComponent: () => import('./features/booking/booking.component').then(m => m.BookingComponent), canActivate: [authGuard] },
  { path: 'payment-confirmation', loadComponent: () => import('./features/payment/payment-confirmation/payment-confirmation.component').then(m => m.PaymentConfirmationComponent), canActivate: [authGuard] },
  { path: 'payment-success', loadComponent: () => import('./features/payment/payment-success/payment-success.component').then(m => m.PaymentSuccessComponent), canActivate: [authGuard] },
  { path: 'movies/:id/schedule', loadComponent: () => import('./features/schedule/schedule.component').then(m => m.ScheduleComponent), canActivate: [authGuard] },

  { path: '**', redirectTo: '' }
];
