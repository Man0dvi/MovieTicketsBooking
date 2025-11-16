import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MovieCardComponent } from '../movie-card/movie-card.component';
import { MoviesService } from '../movies.service';
import { NgFor, NgIf } from '@angular/common';

@Component({
  selector: 'app-movie-list',
  standalone: true,
  imports: [CommonModule, FormsModule, MovieCardComponent, CommonModule],
  template: `
    <section>
      <div class="search">
        <input [(ngModel)]="query" (ngModelChange)="onQuery($event)" placeholder="Search movies..." />
      </div>
      <div class="grid">
        <ng-container *ngIf="moviesSvc.filtered() as list">
          <app-movie-card *ngFor="let m of list" [movie]="m"></app-movie-card>
        </ng-container>
      </div>
    </section>
  `,
  styles: [`
    .grid { display:grid; grid-template-columns: repeat(auto-fit, minmax(180px,1fr)); gap:1rem; }
    .search { margin-bottom:1rem; }
  `]
})
export class MovieListComponent {
  query = '';
  constructor(public moviesSvc: MoviesService) {}
  onQuery(q: string) { this.moviesSvc.setQuery(q); }
}
