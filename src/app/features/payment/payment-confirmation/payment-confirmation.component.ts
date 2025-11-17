// src/app/features/payment/payment-confirmation.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { TicketService } from '../../../core/services/ticket.service';
import { Ticket } from '../../../models/ticket.model';

@Component({
  selector: 'app-payment-confirmation',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './payment-confirmation.component.html',
  styleUrls: ['./payment-confirmation.component.scss']
})
export class PaymentConfirmationComponent implements OnInit {
  booking: Ticket | null = null;
  isLoading = true;
  error: string | null = null;

  // pricing constants
  seatPrice = 50;
  serviceFee = 3;
  promo: string | null = null;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private ticketService: TicketService
  ) {}

  ngOnInit(): void {
    const ticketId = this.route.snapshot.queryParamMap.get('ticketId');
    if (!ticketId) {
      // no ticket id -> back to booking
      this.router.navigate(['/booking']);
      return;
    }

    this.isLoading = true;
    this.ticketService.getTicketById(ticketId).subscribe({
      next: (t) => {
        this.booking = t;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load ticket', err);
        this.error = 'Failed to load booking. Please try again.';
        this.isLoading = false;
      }
    });
  }

  get total() {
    if (!this.booking) return 0;
    const seats = this.booking.seats?.length ?? 0;
    return seats * (this.seatPrice + this.serviceFee);
  }

  get formattedTotal() {
    return this.total.toLocaleString('en-IN', { maximumFractionDigits: 0 });
  }

  buyTickets() {
    if (!this.booking) return;

    // Build transaction payload
    const txPayload: any = {
      bookingId: this.booking.id,
      amount: this.total,
      method: 'Simulated',
      createdAt: new Date().toISOString()
    };

    // 1) create transaction on server
    this.ticketService.createTransaction(txPayload).subscribe({
      next: (createdTx) => {
        // 2) update ticket status to Success
        const serverId = this.booking?.id;
        if (serverId) {
          this.ticketService.updateTicketStatus(serverId, 'Success').subscribe({
            next: () => {
              // 3) navigate to success page with txId
              this.router.navigate(['/payment-success'], { queryParams: { txId: createdTx.id } });
            },
            error: (err) => {
              console.warn('Failed to update ticket status', err);
              // still navigate to success but warn via console
              this.router.navigate(['/payment-success'], { queryParams: { txId: createdTx.id } });
            }
          });
        } else {
          // fallback: navigate with tx id
          this.router.navigate(['/payment-success'], { queryParams: { txId: createdTx.id } });
        }
      },
      error: (err) => {
        console.error('Failed to create transaction', err);
        this.error = 'Payment failed. Please try again.';
      }
    });
  }
// add these methods inside the PaymentConfirmationComponent class

/** Return a comma-joined seats string or 'None' */
public seatsList(): string {
  return (this.booking && this.booking.seats && this.booking.seats.length)
    ? this.booking.seats.join(', ')
    : 'None';
}

/** Return number of seats (0 if none) */
public seatsCount(): number {
  return this.booking?.seats?.length ?? 0;
}

/** Return a label safe for aria attributes */
public seatsForAria(): string {
  return (this.booking && this.booking.seats && this.booking.seats.length)
    ? this.booking.seats.join(', ')
    : 'no seats';
}

  goBack() {
    this.router.navigate(['/booking']);
  }
}
