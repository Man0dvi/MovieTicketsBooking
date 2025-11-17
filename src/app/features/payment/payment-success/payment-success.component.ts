// src/app/features/payment/payment-success.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { TicketService } from '../../../core/services/ticket.service';

@Component({
  selector: 'app-payment-success',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './payment-success.component.html',
  styleUrls: ['./payment-success.component.scss']
})
export class PaymentSuccessComponent implements OnInit {
  tx: any = null;
  isLoading = true;
  error: string | null = null;

  constructor(private router: Router, private route: ActivatedRoute, private ticketService: TicketService) {}

  ngOnInit(): void {
    const txId = this.route.snapshot.queryParamMap.get('txId');
    if (!txId) {
      this.isLoading = false;
      return;
    }
    this.ticketService.getTransactionById(txId).subscribe({
      next: (t) => {
        this.tx = t;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load transaction', err);
        this.error = 'Failed to load transaction details';
        this.isLoading = false;
      }
    });
  }

  explore() {
    // navigate to home. we do not clear server-side data.
    this.router.navigate(['/']);
  }
}
