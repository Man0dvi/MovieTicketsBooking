import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import type { Movie } from '../movies.service';
import { MoviesService } from '../movies.service';

@Component({
  selector: 'app-movie-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <section *ngIf="movie">
      <h2>{{ movie.title }}</h2>
      <img [src]="movie.poster" [alt]="movie.title" />
      <p>{{ movie.description }}</p>
      <p>Duration: {{ movie.duration }} mins</p>
      <button (click)="bookNow()">Book Now</button>
    </section>
    <p *ngIf="!movie">Movie not found</p>
  `
})
export class MovieDetailComponent {
  movie: Movie | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private svc: MoviesService
  ) {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.movie = this.svc.getMovieById(id);
    }
  }

  bookNow() {
    if (!this.movie) return;
    const booking = {
      movieId: this.movie.id,
      seats: [] as string[],
      createdAt: new Date().toISOString()
    };
    localStorage.setItem('cinema_booking', JSON.stringify(booking));
    // navigate to booking page
    this.router.navigate(['/booking']);
  }
}
