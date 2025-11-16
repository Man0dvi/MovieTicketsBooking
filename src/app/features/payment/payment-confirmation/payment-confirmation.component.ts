// src/app/features/payment/payment-confirmation.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';

interface Booking {
  movieId: string | null;
  movieTitle?: string;
  theaterName?: string;
  time?: string;
  date?: string;
  seats: string[];
  createdAt?: string;
}

@Component({
  selector: 'app-payment-confirmation',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './payment-confirmation.component.html',
  styleUrls: ['./payment-confirmation.component.scss']
})
export class PaymentConfirmationComponent {
  bookingKey = 'cinema_booking';
  booking: Booking | null = null;

  // pricing constants (adjust later)
  seatPrice = 50;
  serviceFee = 3;
  promo: string | null = null;

  constructor(private router: Router) {
    const raw = localStorage.getItem(this.bookingKey);
    if (raw) {
      try { this.booking = JSON.parse(raw); }
      catch { localStorage.removeItem(this.bookingKey); this.booking = null; }
    }
  }

  get total() {
    if (!this.booking) return 0;
    const seats = this.booking.seats.length;
    return seats * (this.seatPrice + this.serviceFee);
  }

  get formattedTotal() {
    return this.total.toLocaleString('en-IN', { maximumFractionDigits: 0 });
  }

  buyTickets() {
    if (!this.booking) return;
    const transaction = {
      id: 'tx_' + Date.now(),
      booking: this.booking,
      amount: this.total,
      method: 'Simulated',
      createdAt: new Date().toISOString()
    };
    localStorage.setItem('cinema_transaction', JSON.stringify(transaction));
    // navigate to success
    this.router.navigate(['/payment-success']);
  }

  goBack() {
    this.router.navigate(['/booking']); // or whatever route shows seat selection
  }
}
