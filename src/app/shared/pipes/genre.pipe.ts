import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'genreList',
  standalone: true
})
export class GenrePipe implements PipeTransform {
  transform(genres: string[] | null | undefined): string {
    if (!Array.isArray(genres) || genres.length === 0) return '';
    return genres.join(', ');
  }
}