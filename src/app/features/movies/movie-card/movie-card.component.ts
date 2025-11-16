// src/app/features/movies/movie-card/movie-card.component.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-movie-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './movie-card.component.html',
  styleUrls: ['./movie-card.component.scss']
})
export class MovieCardComponent {
  @Input() movie: any;

  // A) child -> parent event: emits movie id when user activates the card
  @Output() cardClick = new EventEmitter<string>();

  // keep same poster fallback logic
  get posterUrl(): string {
    const m = this.movie || {};
    if (m.poster) return m.poster;
    if (m.image && typeof m.image === 'string' && m.image.startsWith('http')) return m.image;
    if (m.image && typeof m.image === 'string' && m.image.includes('.'))
      return `/assets/posters/${m.image}`;
    if (m.id) return `/assets/posters/${m.id}.png`;
    return '/assets/posters/placeholder.png';
  }

  // invoked by template (click or keyboard activation)
  onActivate() {
    if (!this.movie || !this.movie.id) return;
    this.cardClick.emit(this.movie.id);
  }

  // keyboard handler to allow Enter / Space activation
  onKeydown(ev: KeyboardEvent) {
    if (ev.key === 'Enter' || ev.key === ' ') {
      ev.preventDefault();
      this.onActivate();
    }
  }
}
