// src/app/core/services/ticket.service.ts
import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Ticket } from '../../models/ticket.model';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { tap } from 'rxjs/operators';
 // inside src/app/core/services/ticket.service.ts
import { NotificationService } from './notification.service'; // add import

// inject

@Injectable({ providedIn: 'root' })
export class TicketService {
  private resource = 'tickets';
  private txResource = 'transactions';

  // reactive tickets stream
  private ticketsSubject = new BehaviorSubject<Ticket[] | null>(null);
  public tickets$ = this.ticketsSubject.asObservable();

  
  constructor(private api: ApiService, private notify: NotificationService) {} 



bookTicket(ticket: Omit<Ticket, 'id' | 'createdAt'>): Observable<Ticket> {
  const payload = { ...ticket, createdAt: new Date().toISOString() };
  return this.api.post<Ticket>(this.resource, payload).pipe(
    tap((saved) => {
      const cur = this.ticketsSubject.value ?? [];
      this.ticketsSubject.next([saved, ...cur]);
      // show success toast
      try { this.notify.success('Ticket booked successfully'); } catch {}
    })
  );
}


  getTickets(userId?: number | string): Observable<Ticket[]> {
  // Build base with _expand=movie so json-server will attach movie object
  let url = `${this.resource}?_expand=movie`;

  if (userId !== undefined && userId !== null && String(userId).length > 0) {
    // add user filter
    url = `${this.resource}?userId=${encodeURIComponent(String(userId))}&_expand=movie`;
  }

  return this.api.get<Ticket[]>(url);
}



  /** Load tickets for a user and emit into tickets$ */
  refreshTicketsForUser(userId?: number | string): Observable<Ticket[]> {
    if (userId === undefined || userId === null) {
      this.ticketsSubject.next([]);
      return of([]);
    }
    return this.getTickets(userId).pipe(
      tap(list => this.ticketsSubject.next(list))
    );
  }

  /** Get ticket by id */
  getTicketById(id: number | string): Observable<Ticket> {
    return this.api.get<Ticket>(`${this.resource}/${id}`);
  }

  /** Patch ticket status (or fields) */
  updateTicketStatus(id: number | string, status: 'Success' | 'Failed' | 'Pending') {
    return this.api.patch<Ticket>(`${this.resource}/${id}`, { status });
  }

  /** Create a transaction record on the server */
  createTransaction(tx: any): Observable<any> {
    // tx should include: bookingId (ticket id), amount, method, createdAt, etc.
    return this.api.post<any>(this.txResource, tx);
  }

  /** Get transaction by id */
  getTransactionById(id: number | string): Observable<any> {
    return this.api.get<any>(`${this.txResource}/${id}`);
  }

  /** Optional: clear tickets (on logout) */
  clearCachedTickets() {
    this.ticketsSubject.next([]);
  }
}
