import { Component, inject, signal } from '@angular/core';
import { MovieService } from '../../services/movie-service';
import { OnInit } from '@angular/core';
import { Movie } from '../../movie';
import { Router } from '@angular/router';
import { genreLabel } from '../../genre';
@Component({
  imports: [],
  selector: 'app-movie-list',
  styleUrl: './movie-list.css',
  templateUrl: './movie-list.html',
})
export class MovieList implements OnInit {
  router = inject(Router);
  movieService = inject(MovieService)
  genreLabel = genreLabel;
  loading = signal(true);
  error = signal(false);
  ngOnInit(): void {
    this.loadMovies();
  }
  loadMovies() {
    this.loading.set(true);
    this.error.set(false);
    this.movieService.getMovieList().subscribe({
      next: response => {
        this.movieService.movieList.set(response);
        this.loading.set(false);
      },
      error: () => {
        this.error.set(true);
        this.loading.set(false);
      },
    });
  }
  navigateTo(movie :Movie){
    this.router.navigate(['/movie', movie.id]);
  }
  toggleWish(event: Event, movie: Movie) {
    event.stopPropagation();
    this.movieService.toggleWish(movie);
  }
  clearGenres() {
    this.movieService.selectedGenres.set([]);
  }
  setMinRating(event: Event) {
    this.movieService.minRating.set(Number((event.target as HTMLInputElement).value));
  }
  setYear(event: Event) {
    this.movieService.selectedYear.set((event.target as HTMLSelectElement).value || null);
  }
}
