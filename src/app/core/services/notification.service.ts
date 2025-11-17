// src/app/core/services/notification.service.ts
import { Injectable, Optional } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  // MatSnackBar is optional — fallback to window.alert for minimal dependency
  constructor(@Optional() private snackBar?: MatSnackBar) {}

  success(message: string, opts: { duration?: number } = {}) {
    if (this.snackBar) {
      this.snackBar.open(message, 'Close', {
        duration: opts.duration ?? 3000,
        panelClass: ['snack-success']
      });
    } else {
      // graceful fallback
      try { console.log('SUCCESS:', message); } catch {}
      alert(message);
    }
  }

  error(message: string, opts: { duration?: number } = {}) {
    if (this.snackBar) {
      this.snackBar.open(message, 'Close', {
        duration: opts.duration ?? 5000,
        panelClass: ['snack-error']
      });
    } else {
      try { console.error('ERROR:', message); } catch {}
      alert(`Error: ${message}`);
    }
  }

  info(message: string, opts: { duration?: number } = {}) {
    if (this.snackBar) {
      this.snackBar.open(message, 'Close', {
        duration: opts.duration ?? 3000,
        panelClass: ['snack-info']
      });
    } else {
      console.log('INFO:', message);
    }
  }
}
