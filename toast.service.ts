// src/app/core/services/toast.service.ts
import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({ providedIn: 'root' })
export class ToastService {
  constructor(private snack: MatSnackBar) {}

  showSuccess(message: string, duration = 3000) {
    this.snack.open(message, 'OK', {
      duration,
      panelClass: ['toast-success'],
      horizontalPosition: 'right',
      verticalPosition: 'top'
    });
  }

  showError(message: string, duration = 5000) {
    this.snack.open(message, 'Close', {
      duration,
      panelClass: ['toast-error'],
      horizontalPosition: 'right',
      verticalPosition: 'top'
    });
  }
}
