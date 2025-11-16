// src/app/features/home/home-search.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';
import { of } from 'rxjs';

type Genre = string;

export interface Movie {
  id: string;
  title: string;
  image?: string;
  rating?: string;
  duration?: string;
  certification?: string;
  director?: string;
  genre?: Genre[];
  release_date?: string;
  // optional runtime field
  nowShowing?: boolean;
}

const MOVIES_JSON_URL = '/assets/data/movies.json'; // adjust if your filename/path differs

@Component({
  selector: 'app-home-search',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, HttpClientModule],
  templateUrl: './home-search.component.html',
  styleUrls: ['./home-search.component.scss']
})
export class HomeSearchComponent implements OnInit {
  // non-nullable FormControl so valueChanges emits string (no null)
  searchControl = new FormControl('', { nonNullable: true });

  // full movie list loaded from assets
  movies: Movie[] = [];

  // filtered results shown in "Filtered" block
  filteredMovies: Movie[] = [];

  // convenience getter for now-showing slice
  get nowShowingMovies(): Movie[] {
    return this.movies.filter(m => m.nowShowing);
  }

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    // load movies from assets (local JSON)
    this.http.get<Movie[]>(MOVIES_JSON_URL).subscribe({
      next: (data) => {
        // Defensive: ensure array and types
        if (!Array.isArray(data)) {
          this.movies = [];
          return;
        }

        // assign and coerce: if there is no nowShowing flag in JSON,
        // mark first N items as now showing (customize N as needed)
        const defaultNowShowingCount = 6;
        this.movies = data.map((m, idx) => ({
          ...m,
          nowShowing: typeof m.nowShowing === 'boolean' ? m.nowShowing : idx < defaultNowShowingCount
        }));
      },
      error: (err) => {
        console.error('Failed to load movies JSON', err);
        this.movies = [];
      }
    });

    // wire up search with proper typing and ordering:
    // map -> debounce -> distinctUntilChanged so types remain string
    this.searchControl.valueChanges.pipe(
      map(v => (v || '').trim()), // coerce to string, remove whitespace
      debounceTime(250),
      distinctUntilChanged()
    ).subscribe(query => {
      if (!query) {
        // clear filtered block when empty
        this.filteredMovies = [];
        return;
      }
      this.filteredMovies = this.filterMoviesClient(query);
    });
  }

  private filterMoviesClient(query: string): Movie[] {
    const q = query.toLowerCase();
    // Filter across title (you can add director/genre as well)
    return this.movies.filter(m => (m.title || '').toLowerCase().includes(q));
  }

  clearSearch(): void {
    this.searchControl.setValue('');
  }

  trackById(index: number, movie: Movie): string {
    return movie.id;
  }
}
