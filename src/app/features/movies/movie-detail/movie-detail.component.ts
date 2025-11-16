import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-movie-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <section *ngIf="movie; else notFound" class="movie-detail-shell">
      <div class="left">
        <img [src]="posterUrl" [alt]="movie.title" class="poster" />
      </div>

      <div class="right">
        <h1>{{ movie.title }}</h1>
        <div class="meta">
          <span>{{ movie.genre?.join(', ') }}</span>
          <span *ngIf="movie.duration">• {{ movie.duration }}</span>
          <span *ngIf="movie.certification">• {{ movie.certification }}</span>
        </div>

        <p *ngIf="movie.director"><strong>Director:</strong> {{ movie.director }}</p>
        <p *ngIf="movie.description">{{ movie.description }}</p>

        <div class="actions">
          <button (click)="goToSchedule()">See Schedules</button>
          <button (click)="quickBook()">Book Now</button>
        </div>
      </div>
    </section>

    <ng-template #notFound>
      <div class="notfound">
        <p>Movie not found.</p>
        <a routerLink="/">Back home</a>
      </div>
    </ng-template>
  `,
  styles: [`
    .movie-detail-shell { display:flex; gap:24px; padding:20px; color:#fff; }
    .poster { width:320px; border-radius:8px; box-shadow:0 12px 36px rgba(0,0,0,0.6); }
    .right { max-width:720px; }
    .meta { color:#cfcfd6; margin:8px 0; display:flex; gap:8px; align-items:center; }
    .actions { margin-top:16px; display:flex; gap:10px; }
    button { background:#e50914; border:none; color:#fff; padding:8px 12px; border-radius:6px; cursor:pointer; }
    button.secondary { background:transparent; border:1px solid rgba(255,255,255,0.08); color:#fff; }
  `]
})
export class MovieDetailComponent implements OnInit {
  movie: any | null = null;
  private moviesUrl = '/assets/data/movies.json';

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  async ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;
    try {
      const resp = await fetch(this.moviesUrl);
      const arr = await resp.json();
      this.movie = arr.find((m: any) => m.id === id) || null;
    } catch (e) {
      console.error('Failed loading movies', e);
      this.movie = null;
    }
  }

  get posterUrl() {
    if (!this.movie) return '/assets/posters/placeholder.png';
    if (this.movie.poster) return this.movie.poster;
    if (this.movie.id) return `/assets/posters/${this.movie.id}.png`;
    return '/assets/posters/placeholder.png';
  }

  goToSchedule() {
    if (!this.movie) return;
    this.router.navigate(['/movies', this.movie.id, 'schedule']);
  }

  quickBook() {
    if (!this.movie) return;
    const booking = {
      movieId: this.movie.id,
      movieTitle: this.movie.title,
      theaterName: undefined,
      date: undefined,
      time: undefined,
      price: undefined,
      seats: [],
      createdAt: new Date().toISOString()
    };
    localStorage.setItem('cinema_booking', JSON.stringify(booking));
    this.router.navigate(['/booking']);
  }
}
