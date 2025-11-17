// src/app/models/ticket.model.ts

export interface PurchaseLine {
  label: string;
  amount: number;
}

export type TicketStatus = 'Success' | 'Failed' | 'Pending';

export interface MovieLite {
  id?: number | string;
  title?: string;
  poster?: string;
  posterUrl?: string;
  image?: string;
  // Add other movie fields you care about (optional)
}

export interface Ticket {
  id?: number | string;
  userId: number | string;
  movieId: string | number;
  movieTitle?: string;
  location?: string;
  class?: string;
  date?: string; // e.g., "2025-12-16"
  time?: string; // e.g., "14:40"
  studio?: string;
  bookingCode?: string;
  passwordKey?: string;
  seats?: string[]; // e.g., ["C8","C9"]
  purchaseDetails?: PurchaseLine[]; // list of price lines
  promoCode?: string | null;
  totalPayment?: number;
  status?: TicketStatus;
  createdAt?: string; // ISO timestamp

  // <-- new optional expanded movie reference (populated when using ?_expand=movie)
  movie?: MovieLite;
}
