import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TicketService } from '../../core/services/ticket.service';
import { AuthService } from '../../core/services/auth.service';
import { Observable } from 'rxjs';
import { Ticket } from '../../models/ticket.model';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-my-tickets',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './my-tickets.component.html',
  styleUrls: ['./my-tickets.component.scss']
})
export class MyTicketsComponent implements OnInit {
  public tickets$: Observable<Ticket[] | null>;
  public loading = true;
  public defaultPoster: string;

  private currentUserId: string | number | null = null;

  constructor(
    private ticketService: TicketService,
    private auth: AuthService
  ) {
    // inline SVG fallback so we never 404 on a missing default file
    this.defaultPoster = 'data:image/svg+xml;utf8,' + encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="300"><rect width="100%" height="100%" fill="#2b2b39"/><text x="50%" y="50%" font-size="16" fill="#fff" dominant-baseline="middle" text-anchor="middle">No poster</text></svg>`
    );

    // tickets$ observable (subject) from service — may be null until refreshTicketsForUser is called
    this.tickets$ = this.ticketService.tickets$;
  }

  ngOnInit(): void {
    // get user id from auth (sync access to BehaviorSubject value)
    const u = (this.auth as any).currentUserSubject?.value;
    this.currentUserId = u?.id ?? u?.userId ?? null;

    // debug: log tickets whenever they update
    this.tickets$.subscribe(list => {
      console.log('MyTickets - tickets update:', list);
      this.loading = false;
    });

    // trigger refresh which will call GET /tickets?userId=…&_expand=movie
    if (this.currentUserId) {
      this.ticketService.refreshTicketsForUser(this.currentUserId).subscribe({
        next: () => { /* handled by tickets$ subscription above */ },
        error: (err) => {
          console.error('Failed to load tickets', err);
          this.loading = false;
        }
      });
    } else {
      // no user: mark not loading and emit empty state
      this.ticketService.clearCachedTickets();
      this.loading = false;
    }
  }

  /**
   * Compute the poster src for a ticket using best available info:
   * 1) ticket.movie.poster (json-server _expand=movie)
   * 2) ticket.movie.image (your original movies used `image`)
   * 3) /assets/posters/<movieId>.png (you said posters are named this way)
   * 4) inline SVG defaultPoster
   */
  public posterFor(t: Ticket): string {
    if (!t) return this.defaultPoster;

    // 1 & 2: expanded movie object
    const movie = (t as any).movie;
    if (movie) {
      if (movie.poster) return movie.poster;
      if (movie.image) {
        // if image is a placeholder key, try constructing from movie.id instead
        if (movie.image && movie.image.startsWith('http')) return movie.image;
        // otherwise fallthrough to movie id-based path
      }
    }

    // 3: construct path from movieId (movie_001 -> /assets/posters/movie_001.png)
    if (t.movieId) {
      // normalize movieId to string
      const mid = String(t.movieId).trim();
      if (mid.length) {
        return `/assets/posters/${mid}.png`;
      }
    }

    // 4: fallback inline
    return this.defaultPoster;
  }

  // fallback handler when an image fails to load at the browser level
  public onImgError(ev: Event) {
    const img = ev.target as HTMLImageElement;
    if (img && img.src !== this.defaultPoster) {
      img.src = this.defaultPoster;
    }
  }
}
