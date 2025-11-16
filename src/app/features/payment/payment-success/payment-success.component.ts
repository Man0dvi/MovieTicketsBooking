// src/app/features/payment/payment-success.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';

@Component({
  selector: 'app-payment-success',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './payment-success.component.html',
  styleUrls: ['./payment-success.component.scss']
})
export class PaymentSuccessComponent {
  tx: any = null;

  constructor(private router: Router) {
    const raw = localStorage.getItem('cinema_transaction');
    if (raw) {
      try { this.tx = JSON.parse(raw); }
      catch { this.tx = null; }
    }
  }

  explore() {
    // optionally clear booking/transaction
    localStorage.removeItem('cinema_booking'); // optional
    // keep transaction for history or clear: localStorage.removeItem('cinema_transaction');
    this.router.navigate(['/']);
  }
}
