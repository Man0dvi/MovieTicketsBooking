// src/app/features/movies/movie-list/movie-list.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MovieCardComponent } from '../movie-card/movie-card.component';

@Component({
  selector: 'app-movie-list',
  standalone: true,
  imports: [CommonModule, FormsModule, MovieCardComponent],
  template: `
    <section class="movie-list-shell">
      <div class="search-row">
        <input [(ngModel)]="query" (ngModelChange)="applyFilter()" placeholder="Search movies..." />
      </div>

      <div class="grid">
        <ng-container *ngIf="filtered.length; else noResult">
          <!-- bind to cardClick and navigate in parent -->
          <app-movie-card
            *ngFor="let m of filtered"
            [movie]="m"
            (cardClick)="openMovie($event)">
          </app-movie-card>
        </ng-container>

        <ng-template #noResult>
          <div class="empty">No movies found.</div>
        </ng-template>
      </div>
    </section>
  `,
  styles: [`
    .movie-list-shell { padding: 20px 6%; box-sizing: border-box; color:#fff; }
    .search-row { margin-bottom:12px; max-width:520px; }
    input { width:100%; padding:8px 10px; border-radius:6px; border:1px solid rgba(255,255,255,0.06); background:transparent; color:#fff; }
    .grid { display:grid; grid-template-columns: repeat(auto-fill, minmax(180px,1fr)); gap:16px; }
    .empty { color:#cfcfd6; padding:24px; }
  `]
})
export class MovieListComponent implements OnInit {
  all: any[] = [];
  filtered: any[] = [];
  query = '';
  private moviesUrl = '/assets/data/movies.json';

  constructor(private router: Router) {}

  async ngOnInit() {
    try {
      const resp = await fetch(this.moviesUrl);
      this.all = await resp.json();
      this.applyFilter();
    } catch (e) {
      console.error('Failed to load movies', e);
      this.all = [];
      this.filtered = [];
    }
  }

  applyFilter() {
    const q = (this.query || '').toLowerCase().trim();
    if (!q) {
      this.filtered = [...this.all];
      return;
    }
    this.filtered = this.all.filter(m =>
      (m.title || '').toLowerCase().includes(q) ||
      (m.genre || []).join(' ').toLowerCase().includes(q)
    );
  }

  // handle click emitted by child; keep same behavior: go to schedule page
  openMovie(id: string) {
    if (!id) return;
    this.router.navigate(['/movies', id, 'schedule']);
  }
}