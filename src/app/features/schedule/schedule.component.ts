// src/app/features/schedule/schedule.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';

type Movie = any;
type Theater = any;

@Component({
  selector: 'app-schedule',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './schedule.component.html',
  styleUrls: ['./schedule.component.scss']
})
export class ScheduleComponent implements OnInit {
  movieId: string | null = null;
  movie: Movie | null = null;
  theaters: Theater[] = [];
  allMovies: Movie[] = [];

  // UI state
  dates: { label: string; iso: string }[] = [];
  selectedDateIso = '';
  selectedTheater: Theater | null = null;
  selectedShow: { showtype?: string; time?: string; price?: number } | null = null;

  constructor(private route: ActivatedRoute, private router: Router) {}

  async ngOnInit() {
    // movie id from route if present, else default to movie_002
    this.movieId = this.route.snapshot.paramMap.get('id') || 'movie_002';

    // prepare dates (5 days)
    this.prepareDates(5);

    // load assets
    const [moviesResp, theatersResp] = await Promise.all([
      fetch('/assets/data/movies.json'),
      fetch('/assets/data/theaters.json')
    ]);
    this.allMovies = await moviesResp.json();
    this.theaters = await theatersResp.json();

    this.movie = this.allMovies.find((m: any) => m.id === this.movieId) || this.allMovies[0] || null;

    // default selected date = first
    if (this.dates.length) this.selectedDateIso = this.dates[0].iso;
  }

  prepareDates(n: number) {
    const d0 = new Date();
    for (let i = 0; i < n; i++) {
      const d = new Date(d0);
      d.setDate(d0.getDate() + i);
      const iso = d.toISOString().slice(0, 10);
      const label = d.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' });
      this.dates.push({ label, iso });
    }
  }

  // when user picks a time slot
  pickShow(theater: Theater, showType: any, time: string) {
    this.selectedTheater = theater;
    this.selectedShow = { showtype: showType.type || showType, time, price: showType.price || showType.price_min || showType.price_max || 0 };
  }

  // persist booking stub and navigate to booking page
  bookNow() {
    if (!this.movie || !this.selectedTheater || !this.selectedShow) return;
    const booking = {
      movieId: this.movie.id,
      movieTitle: this.movie.title,
      theaterId: this.selectedTheater.id,
      theaterName: this.selectedTheater.name,
      date: this.selectedDateIso,
      showType: this.selectedShow.showtype,
      time: this.selectedShow.time,
      price: this.selectedShow.price,
      seats: [] as string[],
      createdAt: new Date().toISOString()
    };
    localStorage.setItem('cinema_booking', JSON.stringify(booking));
    this.router.navigate(['/booking']);
  }

  // helper to format price
  money(v: number | undefined) {
    if (v == null) return '-';
    return 'Rp. ' + (v >= 1000 ? v.toLocaleString() : v.toString());
  }
}