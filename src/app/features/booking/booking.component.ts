import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';

interface Booking {
  movieId: string | null;
  movieTitle?: string;
  theaterName?: string;
  date?: string;
  time?: string;
  price?: number; // price per seat (number)
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
  booking: Booking = { movieId: null, seats: [] };

  // seat map configuration
  rows = ['A','B','C','D','E','F','G','H'];
  cols = Array.from({length:10}, (_,i) => i+1); // 1..10

  // simulate some already-taken seats deterministically per show
  taken: Set<string> = new Set();

  // UI limits
  maxSelection = 6;

  constructor(private router: Router) {}

  ngOnInit() {
    const raw = localStorage.getItem(this.bookingKey);
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as Booking;
        // ensure seats array present
        parsed.seats = parsed.seats || [];
        this.booking = parsed;
        // build deterministic taken seats for the show (so UI looks realistic)
        this.taken = this.simulateTakenSeats(this.booking);
      } catch {
        localStorage.removeItem(this.bookingKey);
        this.booking = { movieId: null, seats: [] };
      }
    }
  }

  // Toggle seat selection
  selectSeat(seat: string) {
    if (!this.booking.movieId) return;
    if (this.taken.has(seat)) return; // cannot select taken

    const already = this.booking.seats.includes(seat);
    if (already) {
      this.booking.seats = this.booking.seats.filter(s => s !== seat);
    } else {
      if (this.booking.seats.length >= this.maxSelection) {
        alert(`You can select up to ${this.maxSelection} seats.`);
        return;
      }
      this.booking.seats = [...this.booking.seats, seat];
    }
    this.persist();
  }

  persist() {
    localStorage.setItem(this.bookingKey, JSON.stringify(this.booking));
  }

  confirmBooking() {
    if (!this.booking.movieId || this.booking.seats.length === 0) return;
    const confirmed = { ...this.booking, confirmedAt: new Date().toISOString() };
    localStorage.setItem(this.bookingKey, JSON.stringify(confirmed));
    // navigate to payment confirmation
    this.router.navigate(['/payment-confirmation']);
  }

  // helpers
  isTaken(seat: string) { return this.taken.has(seat); }
  isSelected(seat: string) { return this.booking.seats.includes(seat); }

  pricePerSeat() {
    return this.booking.price ?? 50000; // fallback price
  }

  totalAmount() {
    return (this.booking.seats.length || 0) * this.pricePerSeat();
  }

  formattedAmount(v: number) {
    return new Intl.NumberFormat('id-ID').format(v);
  }

  // deterministic pseudo-random taken seats per show (so page shows some filled seats)
  simulateTakenSeats(b: Booking): Set<string> {
    const out = new Set<string>();
    if (!b || !b.movieId) return out;
    // build seed from movieId + date + time
    const seedStr = `${b.movieId}::${b.date || ''}::${b.time || ''}`;
    let seed = 0;
    for (let i=0;i<seedStr.length;i++) seed = (seed * 31 + seedStr.charCodeAt(i)) >>> 0;
    // pick up to 12 seats as taken
    const maxTaken = 12;
    const totalSeats = this.rows.length * this.cols.length;
    for (let k=0; out.size < Math.min(maxTaken, Math.floor(totalSeats*0.25)); k++) {
      seed = (seed * 1664525 + 1013904223) >>> 0;
      const idx = seed % totalSeats;
      const r = Math.floor(idx / this.cols.length);
      const c = (idx % this.cols.length) + 1;
      const seat = `${this.rows[r]}${c}`;
      // avoid marking user already selected seats as taken
      if (b.seats.includes(seat)) continue;
      out.add(seat);
      if (k > 200) break;
    }
    return out;
  }

  // reset selection and persist
  clearSelection() {
    this.booking.seats = [];
    this.persist();
  }
}
