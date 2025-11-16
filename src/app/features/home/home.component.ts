import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MovieCardComponent } from '../movies/movie-card/movie-card.component';
import { RouterModule } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';

type Movie = any;
type Section = { name: string; movie_ids: string[]; movies?: Movie[] };

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, MovieCardComponent, ReactiveFormsModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  sections: Section[] = [];
  moviesById: Record<string, Movie> = {};
  allMovies: Movie[] = [];

  // 🔎 search control
  searchControl = new FormControl('', { nonNullable: true });

  // results for the Filtered section
  filteredMovies: Movie[] = [];

  get isSearching(): boolean {
    return this.searchControl.value.trim().length > 0;
  }

  async ngOnInit() {
    // load JSON files
    const [sectionsResp, moviesResp] = await Promise.all([
      fetch('/assets/data/movie-sections.json'),
      fetch('/assets/data/movies.json')
    ]);

    const sectionsJson = await sectionsResp.json();
    const moviesJson = await moviesResp.json();

    this.allMovies = moviesJson;

    // build movie lookup map
    for (const m of moviesJson) this.moviesById[m.id] = m;

    // attach movies to each section
    this.sections = sectionsJson.map((s: any) => ({
      ...s,
      movies: s.movie_ids.map((id: string) => this.moviesById[id]).filter(Boolean)
    }));

    // enable search logic
    this.initSearch();
  }

  initSearch() {
    this.searchControl.valueChanges.pipe(
      map(v => v.trim()),
      debounceTime(250),
      distinctUntilChanged()
    ).subscribe(query => {
      if (!query) {
        this.filteredMovies = [];
        return;
      }

      const q = query.toLowerCase();

      // Filter across ALL MOVIES (recommended)
      this.filteredMovies = this.allMovies.filter(m =>
        m.title?.toLowerCase().includes(q)
      );
    });
  }

  clearSearch() {
    this.searchControl.setValue('');
  }

  // existing scroll helpers
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
