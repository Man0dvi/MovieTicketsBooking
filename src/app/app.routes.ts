// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { AuthGuard } from './features/auth/auth.guard';

export const routes: Routes = [
  { path: 'signin', loadComponent: () => import('./features/auth/sign-in/sign-in.component').then(m => m.SignInComponent) },
  { path: 'signup', loadComponent: () => import('./features/auth/sign-up/sign-up.component').then(m => m.SignUpComponent) },

  // protect all app pages
  { path: '', loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent), canActivate: [AuthGuard] },
  { path: 'movies', loadComponent: () => import('./features/movies/movie-list/movie-list.component').then(m => m.MovieListComponent), canActivate: [AuthGuard] },
  { path: 'movies/:id', loadComponent: () => import('./features/movies/movie-detail/movie-detail.component').then(m => m.MovieDetailComponent), canActivate: [AuthGuard] },
  { path: 'movies/:id/schedule', loadComponent: () => import('./features/schedule/schedule.component').then(m => m.ScheduleComponent), canActivate: [AuthGuard] },
  { path: 'booking', loadComponent: () => import('./features/booking/booking.component').then(m => m.BookingComponent), canActivate: [AuthGuard] },
  { path: 'payment-confirmation', loadComponent: () => import('./features/payment/payment-confirmation/payment-confirmation.component').then(m => m.PaymentConfirmationComponent), canActivate: [AuthGuard] },
  { path: 'payment-success', loadComponent: () => import('./features/payment/payment-success/payment-success.component').then(m => m.PaymentSuccessComponent), canActivate: [AuthGuard] },
  { path: 'my-tickets', loadComponent: () => import('./features/account/my-tickets.component').then(m => m.MyTicketsComponent), canActivate: [AuthGuard] },

  // fallback
  { path: '**', redirectTo: '' }
];
