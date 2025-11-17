// src/app/features/booking/booking.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { TicketService } from '../../core/services/ticket.service';
import { AuthService } from '../../core/services/auth.service';
import { Ticket } from '../../models/ticket.model';

interface Booking {
  movieId: string | null;
  movieTitle?: string;
  theaterName?: string;
  date?: string;
  time?: string;
  price?: number;
  seats: string[];
  createdAt?: string;
  confirmedAt?: string;
}

@Component({
  selector: 'app-booking',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './booking.component.html',
  styleUrls: ['./booking.component.scss']
})
export class BookingComponent implements OnInit {
  bookingKey = 'cinema_booking';
  public booking: Booking = { movieId: null, seats: [] };

  // seat map configuration
  public rows = ['A','B','C','D','E','F','G','H'];
  public cols = Array.from({length:10}, (_,i) => i+1); // 1..10

  // simulate some already-taken seats deterministically per show
  public taken: Set<string> = new Set();

  // UI limits
  public maxSelection = 6;

  // auth + saving state
  public currentUserId: number | string | null = null;
  public isSaving = false;
  public saveError: string | null = null;

  constructor(
    private router: Router,
    private ticketService: TicketService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    // Load in-progress booking from localStorage (UI state)
    const raw = localStorage.getItem(this.bookingKey);
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as Booking;
        parsed.seats = parsed.seats || [];
        this.booking = parsed;
      } catch {
        localStorage.removeItem(this.bookingKey);
        this.booking = { movieId: null, seats: [] };
      }
    }

    // Build deterministic taken seats from the loaded booking
    this.taken = this.simulateTakenSeats(this.booking);

    // Subscribe to auth state to get user id (keeps UI reactive)
    this.authService.currentUser$.subscribe(user => {
      if (user && (user as any).id) {
        this.currentUserId = (user as any).id;
      } else {
        this.currentUserId = null;
      }
    });
  }

  // Toggle seat selection
  public selectSeat(seat: string) {
    if (!this.booking.movieId) return;
    if (this.taken.has(seat)) return; // cannot select taken

    const already = this.booking.seats.includes(seat);
    if (already) {
      this.booking.seats = this.booking.seats.filter(s => s !== seat);
    } else {
      if (this.booking.seats.length >= this.maxSelection) {
        // keep simple UI feedback consistent with previous behaviour
        alert(`You can select up to ${this.maxSelection} seats.`);
        return;
      }
      this.booking.seats = [...this.booking.seats, seat];
    }
    this.persist();
  }

  // persist in-progress booking to localStorage
  public persist() {
    try {
      localStorage.setItem(this.bookingKey, JSON.stringify(this.booking));
    } catch (e) {
      // ignore
    }
  }

  public confirmBooking() {
  this.saveError = null;

  if (!this.booking.movieId) {
    this.saveError = 'No movie selected';
    return;
  }
  if (!this.booking.seats || this.booking.seats.length === 0) {
    this.saveError = 'Please select at least one seat';
    return;
  }
  if (!this.currentUserId) {
    this.saveError = 'Please sign in to complete booking';
    this.router.navigate(['/signin']);
    return;
  }

  const bookingCode = this.generateBookingCode();
  const passwordKey = this.generatePasswordKey();

  const purchaseDetails = this.buildPurchaseDetails();
  const totalPayment = this.calcTotal(purchaseDetails);

  const payload: Omit<Ticket, 'id' | 'createdAt'> = {
    userId: this.currentUserId,
    movieId: this.booking.movieId as string,
    movieTitle: this.booking.movieTitle || undefined,
    location: this.booking.theaterName || undefined,
    class: 'Regular 2D',
    date: this.booking.date || undefined,
    time: this.booking.time || undefined,
    studio: undefined,
    bookingCode,
    passwordKey,
    seats: this.booking.seats,
    purchaseDetails,
    promoCode: null,
    totalPayment,
    // mark pending so payment confirmation step is required
    status: 'Pending'
  };

  this.isSaving = true;
  this.ticketService.bookTicket(payload).subscribe({
    next: (saved) => {
      this.isSaving = false;
      // Navigate to payment-confirmation and pass the server ticket id in query param
      this.router.navigate(['/payment-confirmation'], { queryParams: { ticketId: saved.id } });
    },
    error: (err) => {
      console.error('Ticket booking failed', err);
      this.isSaving = false;
      this.saveError = 'Booking failed. Please try again.';
    }
  });
}


  // helpers used by template
  public isTaken(seat: string) { return this.taken.has(seat); }
  public isSelected(seat: string) { return this.booking.seats.includes(seat); }

  public pricePerSeat() {
    return this.booking.price ?? 50000; // fallback price
  }

  public totalAmount() {
    return (this.booking.seats.length || 0) * this.pricePerSeat();
  }

  public formattedAmount(v: number) {
    try {
      return new Intl.NumberFormat('id-ID').format(v);
    } catch {
      return String(v);
    }
  }

  // Build purchase details (same format used previously)
  public buildPurchaseDetails(): { label: string; amount: number }[] {
    const seatCount = this.booking.seats.length || 1;
    const seatTotal = this.pricePerSeat() * seatCount;
    const serviceTotal = 1000 * seatCount; // example service fee per seat
    const lines = [
      { label: 'REGULAR SEAT', amount: seatTotal },
      { label: 'SERVICE FEES', amount: serviceTotal }
    ];
    return lines;
  }

  public calcTotal(lines: { label: string; amount: number }[]) {
    return lines.reduce((s, l) => s + (l.amount || 0), 0);
  }

  // deterministic pseudo-random taken seats per show (so page shows some filled seats)
  public simulateTakenSeats(b: Booking): Set<string> {
    const out = new Set<string>();
    if (!b || !b.movieId) return out;
    const seedStr = `${b.movieId}::${b.date || ''}::${b.time || ''}`;
    let seed = 0;
    for (let i=0;i<seedStr.length;i++) seed = (seed * 31 + seedStr.charCodeAt(i)) >>> 0;
    const maxTaken = 12;
    const totalSeats = this.rows.length * this.cols.length;
    for (let k=0; out.size < Math.min(maxTaken, Math.floor(totalSeats*0.25)); k++) {
      seed = (seed * 1664525 + 1013904223) >>> 0;
      const idx = seed % totalSeats;
      const r = Math.floor(idx / this.cols.length);
      const c = (idx % this.cols.length) + 1;
      const seat = `${this.rows[r]}${c}`;
      if (b.seats.includes(seat)) continue;
      out.add(seat);
      if (k > 200) break;
    }
    return out;
  }

  // reset selection and persist
  public clearSelection() {
    this.booking.seats = [];
    this.persist();
  }

  // small utils
  private generateBookingCode(): string {
    return Array.from({ length: 15 }, () => Math.floor(Math.random() * 10)).join('');
  }

  private generatePasswordKey(): string {
    return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit
  }
}
