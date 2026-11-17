import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { MovieService } from '../../services/movie-service';
import { Movie } from '../../movie';
import { genreLabel } from '../../genre';

@Component({
  imports: [],
  selector: 'app-wish-list',
  styleUrl: './wish-list.css',
  templateUrl: './wish-list.html',
})
export class WishList {
  router = inject(Router);
  movieService = inject(MovieService);
  genreLabel = genreLabel;
  navigateTo(movie: Movie) {
    this.router.navigate(['/movie', movie.id]);
  }
  remove(event: Event, movie: Movie) {
    event.stopPropagation();
    this.movieService.removeFromWish(movie.id);
  }
  backToMovieList() {
    this.router.navigate(['/']);
  }
}
