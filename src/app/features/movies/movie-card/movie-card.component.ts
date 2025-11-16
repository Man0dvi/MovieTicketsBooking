import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-movie-card',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './movie-card.component.html',
  styleUrls: ['./movie-card.component.scss']
})
export class MovieCardComponent {
  @Input() movie: any;

  get posterUrl(): string {
    const m = this.movie || {};
    if (m.poster) return m.poster;
    if (m.image && typeof m.image === 'string' && m.image.startsWith('http')) return m.image;
    if (m.image && typeof m.image === 'string' && m.image.includes('.'))
      return `/assets/posters/${m.image}`;
    if (m.id) return `/assets/posters/${m.id}.png`;
    return '/assets/posters/placeholder.png';
  }
}
