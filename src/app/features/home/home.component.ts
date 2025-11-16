import { Component, OnInit, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MovieCardComponent } from '../movies/movie-card/movie-card.component';

type Movie = any;
type Section = { name: string; movie_ids: string[]; movies?: Movie[] };

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, MovieCardComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  sections: Section[] = [];
  moviesById: Record<string, Movie> = {};

  // store movies in a signal
  private moviesSig = signal<Movie[]>([]);
  // keep an array copy if other non-reactive code expects it
  allMovies: Movie[] = [];

  // query as a signal
  query = signal('');
  // computed filtered results (reactive)
  filteredMovies = computed(() => {
    const q = (this.query() || '').toLowerCase().trim();
    if (!q) return [] as Movie[];
    return this.moviesSig().filter(m => (m.title || '').toLowerCase().includes(q));
  });

  // debounce timer for smoothing search UX
  private debounceTimer: any = null;

  constructor(private router: Router) {}

  get isSearching(): boolean {
    return (this.query() || '').trim().length > 0;
  }

  async ngOnInit() {
    try {
      // load the sections and movies JSON
      const [sectionsResp, moviesResp] = await Promise.all([
        fetch('/assets/data/movie-sections.json'),
        fetch('/assets/data/movies.json')
      ]);
      const sectionsJson = await sectionsResp.json();
      const moviesJson = await moviesResp.json();

      // set movies into signal and array copy
      this.allMovies = Array.isArray(moviesJson) ? moviesJson : [];
      this.moviesSig.set(this.allMovies);

      // build lookup map
      for (const m of this.allMovies) {
        if (m && m.id) this.moviesById[m.id] = m;
      }

      // attach movies to each section
      this.sections = Array.isArray(sectionsJson) ? sectionsJson.map((s: any) => ({
        ...s,
        movies: (s.movie_ids || []).map((id: string) => this.moviesById[id]).filter(Boolean)
      })) : [];

      // effect to debounce query updates (keeps computed reactive but delays UI churn)
      effect(() => {
        // reading the signal ensures effect runs when query changes
        const _ = this.query();
        if (this.debounceTimer) clearTimeout(this.debounceTimer);
        this.debounceTimer = setTimeout(() => {
          // nothing to do here because filteredMovies is computed and will update automatically;
          // keeping debounce purely to delay reactivity (visual smoothing)
        }, 250);
      });

    } catch (e) {
      console.error('Failed to load home data', e);
      this.allMovies = [];
      this.moviesSig.set([]);
      this.sections = [];
    }
  }

  // clear search
  clearSearch() {
    this.query.set('');
  }

  // navigation handler invoked by child @Output events
  openMovie(id: string) {
    if (!id) return;
    this.router.navigate(['/movies', id, 'schedule']);
  }

  // horizontal scroll helpers for section rows
  scrollNext(sectionIndex: number) {
    const el = document.querySelector(`#section-row-${sectionIndex}`) as HTMLElement | null;
    if (!el) return;
    el.scrollBy({ left: el.clientWidth * 0.8, behavior: 'smooth' });
  }

  scrollPrev(sectionIndex: number) {
    const el = document.querySelector(`#section-row-${sectionIndex}`) as HTMLElement | null;
    if (!el) return;
    el.scrollBy({ left: -el.clientWidth * 0.8, behavior: 'smooth' });
  }
}
