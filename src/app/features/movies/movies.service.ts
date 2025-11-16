import { Injectable, signal, computed } from '@angular/core';
import type { Signal } from '@angular/core';

export interface Movie {
  id: string;
  title: string;
  duration: number; // minutes
  poster?: string;
  description?: string;
}

const SAMPLE_MOVIES: Movie[] = [
  { id: '1', title: 'The Great Heist', duration: 125, poster: 'assets/posters/bg-cinema.png', description: 'Action packed...' },
  { id: '2', title: 'Parallel Lives', duration: 98, poster: 'assets/posters/firestarter_placeholder_image.png', description: 'Drama...' },
  // add more sample items or load from assets/movies.json
];

@Injectable({ providedIn: 'root' })
export class MoviesService {
  private _movies = signal<Movie[]>(SAMPLE_MOVIES);
  movies = this._movies.asReadonly();

  // simple search signal
  private _query = signal('');
  query = this._query.asReadonly();

  filtered = computed(() => {
    const q = this._query();
    if (!q) return this._movies();
    return this._movies().filter(m => m.title.toLowerCase().includes(q.toLowerCase()));
  });

  setQuery(q: string) { this._query.set(q); }
  getMovieById(id: string) { return this._movies().find(m => m.id === id) ?? null; }

  // methods to fetch from an API would use HttpClient (provided automatically in main.ts)
}
